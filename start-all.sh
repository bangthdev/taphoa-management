#!/bin/bash
# Chạy tất cả services của taphoa-management
# Usage: taphoa-all           (local)
#        taphoa-all --tunnel   (local + cloudflare named tunnel cho remote access)

PROJECT_DIR="$HOME/Documents/taphoa-management"
BACKEND_DIR="$PROJECT_DIR/backend"
AGENT_DIR="$PROJECT_DIR/agent"
FRONTEND_DIR="$PROJECT_DIR/frontend"
LOG_DIR="$PROJECT_DIR/.logs"
TUNNEL_MODE=false

# Named tunnel config (URL cố định)
TUNNEL_NAME="taphoa"
FRONTEND_DOMAIN="taphoa.bangth.org"
BACKEND_DOMAIN="api-taphoa.bangth.org"

if [ "$1" = "--tunnel" ]; then
    TUNNEL_MODE=true
fi

mkdir -p "$LOG_DIR"

# Backend đọc cấu hình từ biến môi trường chứ không tự nạp .env, và middleware/auth.go
# gọi log.Fatal ngay lúc khởi tạo package nếu thiếu JWT_SECRET.
set -a
[ -f "$BACKEND_DIR/.env" ] && . "$BACKEND_DIR/.env"
set +a

# Màu cho log
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}==============================${NC}"
echo -e "${CYAN}  Taphoa Management - Start   ${NC}"
if $TUNNEL_MODE; then
    echo -e "${CYAN}  (Tunnel mode enabled)       ${NC}"
fi
echo -e "${CYAN}==============================${NC}"

# Kill previous processes.
# `go run` sinh ra một binary con trong ~/.cache/go-build với cmdline hoàn toàn khác,
# nên pkill theo đường dẫn source không giết được nó và tiến trình cũ vẫn giữ cổng
# (config mới sẽ không bao giờ có hiệu lực). Giải phóng theo cổng mới chắc chắn.
free_port() {
    local port=$1
    local pids
    pids=$(ss -ltnp 2>/dev/null | grep ":$port " | grep -oP 'pid=\K[0-9]+' | sort -u)
    [ -n "$pids" ] && kill $pids 2>/dev/null
}

pkill -f "taphoa-management/backend.*main.go" 2>/dev/null
pkill -f "vite.*taphoa" 2>/dev/null
pkill -f "langgraphjs dev" 2>/dev/null
pkill -f "cloudflared tunnel run $TUNNEL_NAME" 2>/dev/null
free_port 8082
free_port 3000
free_port 2024
# Đợi port được giải phóng
sleep 2

# 1. PostgreSQL (docker)
echo -e "\n${YELLOW}[1/4] Starting PostgreSQL...${NC}"
if docker ps --format '{{.Names}}' | grep -q 'taphoa-db'; then
    echo -e "${GREEN}  ✓ PostgreSQL already running${NC}"
else
    docker compose -f "$PROJECT_DIR/docker-compose.yml" up -d
    echo -e "${GREEN}  ✓ PostgreSQL started (port 5434)${NC}"
fi

# Đợi PostgreSQL sẵn sàng
echo -n "  Waiting for DB..."
for i in {1..15}; do
    if docker exec taphoa-db pg_isready -U postgres > /dev/null 2>&1; then
        echo -e " ${GREEN}ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Setup URLs
API_URL_ENV=""
# Danh sách origin cho CORS. Luôn kèm domain tunnel để mở bằng đường nào cũng đăng nhập được,
# không phụ thuộc vào việc có truyền --tunnel hay không.
FRONTEND_URL_ENV="http://localhost:3000,https://$FRONTEND_DOMAIN"

if $TUNNEL_MODE; then
    if ! command -v cloudflared &> /dev/null; then
        echo -e "${RED}cloudflared chưa cài!${NC}"
        exit 1
    fi

    # Named tunnel (URL cố định, không đổi mỗi lần restart)
    echo -e "\n${YELLOW}[T] Starting named tunnel ($TUNNEL_NAME)...${NC}"
    cloudflared tunnel run "$TUNNEL_NAME" > "$LOG_DIR/tunnel.log" 2>&1 &
    echo $! > "$LOG_DIR/tunnel.pid"

    # Đợi tunnel kết nối
    echo -n "  Waiting for connection..."
    for i in {1..15}; do
        if grep -q "Registered tunnel connection" "$LOG_DIR/tunnel.log" 2>/dev/null; then
            echo -e " ${GREEN}done${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done

    API_URL_ENV="https://$BACKEND_DOMAIN/api"
    echo -e "${GREEN}  Frontend: https://$FRONTEND_DOMAIN${NC}"
    echo -e "${GREEN}  Backend:  https://$BACKEND_DOMAIN${NC}"
fi

# 2. Backend (Go) - chạy background, ghi log
echo -e "\n${YELLOW}[2/4] Starting Backend...${NC}"
(cd "$BACKEND_DIR" && FRONTEND_URL="$FRONTEND_URL_ENV" go run main.go) > "$LOG_DIR/backend.log" 2>&1 &
echo $! > "$LOG_DIR/backend.pid"
echo -e "${GREEN}  ✓ Backend starting (port 8082)${NC}"

# 3. AI Agent (langgraph) - trợ lý trong app gọi qua proxy /agent của vite → :2024.
# Không chạy cái này thì widget Trợ lý im lặng và console đầy ERR_CONNECTION_REFUSED.
echo -e "\n${YELLOW}[3/4] Starting AI Agent...${NC}"
if [ -f "$AGENT_DIR/.env" ]; then
    # --no-browser: mặc định langgraphjs dev tự mở LangGraph Studio trên tab mới,
    # không mong muốn khi đang trình diễn.
    (cd "$AGENT_DIR" && npm run dev -- --no-browser) > "$LOG_DIR/agent.log" 2>&1 &
    echo $! > "$LOG_DIR/agent.pid"
    echo -e "${GREEN}  ✓ Agent starting (port 2024)${NC}"
else
    echo -e "${RED}  ✗ Thiếu $AGENT_DIR/.env — bỏ qua agent, widget Trợ lý sẽ không hoạt động${NC}"
fi

# 3. Frontend (React) - chạy background, ghi log
echo -e "\n${YELLOW}[4/4] Starting Frontend...${NC}"
if $TUNNEL_MODE; then
    (cd "$FRONTEND_DIR" && VITE_API_URL="$API_URL_ENV" npm start) > "$LOG_DIR/frontend.log" 2>&1 &
else
    (cd "$FRONTEND_DIR" && npm start) > "$LOG_DIR/frontend.log" 2>&1 &
fi
echo $! > "$LOG_DIR/frontend.pid"
echo -e "${GREEN}  ✓ Frontend starting (port 3000)${NC}"

echo -e "\n${CYAN}==============================${NC}"
echo -e "  DB:       ${GREEN}localhost:5434${NC}"
echo -e "  Backend:  ${GREEN}localhost:8082${NC}"
echo -e "  Agent:    ${GREEN}localhost:2024${NC}"
echo -e "  Frontend: ${GREEN}localhost:3000${NC}"
if $TUNNEL_MODE; then
    echo -e "${CYAN}------------------------------${NC}"
    echo -e "  Frontend: ${GREEN}https://$FRONTEND_DOMAIN${NC}"
    echo -e "  Backend:  ${GREEN}https://$BACKEND_DOMAIN${NC}"
fi
echo -e "${CYAN}==============================${NC}"

echo -e "\n📺 Opening log viewer..."
sleep 1

# Tilix split view
if $TUNNEL_MODE; then
    # Dưới trái: Backend log
    tilix -a session-add-down -e "tail -f $LOG_DIR/backend.log"
    sleep 0.3
    # Dưới phải: Tunnel info
    tilix -a session-add-right -e "bash -c \"echo ''; echo '=================================='; echo '  TUNNEL URLs (fixed)'; echo '=================================='; echo ''; echo '  Frontend: https://$FRONTEND_DOMAIN'; echo ''; echo '  Backend:  https://$BACKEND_DOMAIN'; echo ''; echo '=================================='; echo ''; tail -f $LOG_DIR/tunnel.log\""
else
    # Không tunnel: chỉ split backend log ở dưới
    tilix -a session-add-down -e "tail -f $LOG_DIR/backend.log"
fi

# Terminal chính (trên, full width) = frontend log
exec tail -f "$LOG_DIR/frontend.log"

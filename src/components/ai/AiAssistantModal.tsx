import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDurationHuman } from '../../services/calculation';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  actionLink?: {
    tab: string;
    label: string;
  };
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const {
    tables,
    sessions,
    menu,
    customers,
    pricingRules,
    staff,
    isAdmin,
    currentTime,
  } = useApp();

  const [inputQuery, setInputQuery] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Xin chào! Em là Trợ lý AI Thanh Long Billiards. Em có thể hỗ trợ anh kiểm tra số liệu kinh doanh, bàn đang chơi, tồn kho món gọi, chính sách giá và đề xuất tối ưu doanh thu câu lạc bộ.',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Tình hình các bàn hiện tại',
        'Báo cáo doanh thu hôm nay',
        'Món nào sắp hết hàng?',
        'Bảng giá và ưu đãi hội viên',
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Active metrics calculation
  const activeSessions = sessions.filter((s) => s.status === 'ACTIVE' || s.status === 'WAITING_PAYMENT' || s.status === 'PAUSED');
  const playingTables = tables.filter((t) => t.status === 'PLAYING');
  const availableTables = tables.filter((t) => t.status === 'AVAILABLE');
  const waitingTables = tables.filter((t) => t.status === 'WAITING_PAYMENT');
  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');

  const todayRevenue = completedSessions.reduce((sum, s) => sum + (s.finalTotal || 0), 0);
  const lowStockItems = menu.filter((item) => item.stock <= item.minStockAlert);

  const processAiResponse = (query: string): { reply: string; suggestions?: string[]; actionLink?: { tab: string; label: string } } => {
    const q = query.toLowerCase();

    // 1. Tình hình bàn hiện tại
    if (q.includes('bàn') && (q.includes('hiện tại') || q.includes('tình hình') || q.includes('đang chơi') || q.includes('trống'))) {
      const playingCodes = playingTables.map((t) => t.code).join(', ') || 'Không có';
      const availableCodes = availableTables.map((t) => t.code).join(', ') || 'Hết bàn';
      return {
        reply: `Hiện câu lạc bộ có ${tables.length} bàn:\n- Đang chơi: ${playingTables.length} bàn (${playingCodes})\n- Bàn trống sẵn sàng: ${availableTables.length} bàn (${availableCodes})\n- Đang chờ thanh toán: ${waitingTables.length} bàn\n\nAnh có thể mở nhanh bàn trống hoặc gọi thêm món trên Sơ đồ bàn.`,
        suggestions: ['Báo cáo doanh thu hôm nay', 'Món nào sắp hết hàng?', 'Bàn chơi lâu nhất là bàn nào?'],
        actionLink: { tab: 'tables', label: 'Xem Sơ đồ bàn' },
      };
    }

    // 2. Doanh thu hôm nay
    if (q.includes('doanh thu') || q.includes('báo cáo') || q.includes('tiền thu') || q.includes('hôm nay')) {
      const fnbSum = completedSessions.reduce((sum, s) => sum + (s.ordersFee || 0), 0);
      const tableFeeSum = completedSessions.reduce((sum, s) => sum + (s.tableFee || 0), 0);
      return {
        reply: `Báo cáo số liệu ngày hôm nay:\n- Tổng doanh thu đã chốt: ${formatVND(todayRevenue)}\n- Tiền giờ thi đấu: ${formatVND(tableFeeSum)}\n- Tiền dịch vụ ăn uống & đồ dùng: ${formatVND(fnbSum)}\n- Số lượt chơi đã thanh toán: ${completedSessions.length} lượt\n- Số bàn đang tiếp tục tính giờ: ${activeSessions.length} bàn`,
        suggestions: ['Bàn nào đem lại doanh thu cao nhất?', 'Chi tiết kho hàng', 'Tình hình các bàn hiện tại'],
        actionLink: isAdmin ? { tab: 'reports', label: 'Xem Báo cáo chi tiết' } : undefined,
      };
    }

    // 3. Tồn kho / đồ uống
    if (q.includes('kho') || q.includes('hàng') || q.includes('món') || q.includes('hết')) {
      if (lowStockItems.length === 0) {
        return {
          reply: `Kho hàng đồ uống và F&B hiện đang ở mức ổn định an toàn (toàn bộ các món đều vượt ngưỡng cảnh báo tối thiểu). Hiện có tổng cộng ${menu.length} món trong thực đơn.`,
          suggestions: ['Thực đơn bán chạy', 'Tình hình các bàn hiện tại'],
          actionLink: { tab: 'menu', label: 'Xem Thực đơn & Order' },
        };
      }
      const listStr = lowStockItems
        .map((item) => `- ${item.name}: còn ${item.stock} ${item.unit} (ngưỡng tối thiểu: ${item.minStockAlert})`)
        .join('\n');
      return {
        reply: `Cảnh báo: Hiện có ${lowStockItems.length} món sắp hết hàng cần nhập bổ sung:\n${listStr}\n\nAnh nên kiểm tra và nhập thêm để đảm bảo phục vụ cơ thủ giờ cao điểm.`,
        suggestions: ['Xem thực đơn đầy đủ', 'Báo cáo doanh thu hôm nay'],
        actionLink: { tab: 'menu', label: 'Đi tới Quản lý thực đơn' },
      };
    }

    // 4. Bàn chơi lâu nhất
    if (q.includes('lâu nhất') || q.includes('chơi nhiều nhất') || q.includes('thời gian')) {
      if (activeSessions.length === 0) {
        return {
          reply: 'Hiện tại chưa có bàn nào đang mở phiên chơi.',
          suggestions: ['Tình hình các bàn hiện tại', 'Báo cáo doanh thu hôm nay'],
        };
      }
      const sorted = [...activeSessions].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      const longest = sorted[0];
      const diffMins = Math.max(1, Math.round((currentTime.getTime() - new Date(longest.startTime).getTime()) / 60000));
      return {
        reply: `Bàn đang chơi lâu nhất hiện tại là ${longest.tableCode} (${longest.tableType}):\n- Khách hàng: ${longest.customerName || 'Khách vãng lai'}\n- Thời gian đã chơi: ${formatDurationHuman(diffMins)}\n- Số món đã dùng: ${longest.orders?.length || 0} món\n- Nhân sự phụ trách: ${longest.staffName || 'Nhân viên trực'}`,
        suggestions: ['Tình hình các bàn hiện tại', 'Cách tính tiền bàn này'],
        actionLink: { tab: 'tables', label: 'Xem bàn trên sơ đồ' },
      };
    }

    // 5. Bảng giá & hội viên
    if (q.includes('giá') || q.includes('hội viên') || q.includes('ưu đãi') || q.includes('thẻ')) {
      const priceText = pricingRules
        .map((r) => `- ${r.typeName}: ${formatVND(r.defaultHourlyRate)}/h (Cao điểm: ${formatVND(r.peakHourRate)}/h)`)
        .join('\n');
      return {
        reply: `Chính sách giá giờ và quyền lợi hội viên Thanh Long:\n${priceText}\n\nQuyền lợi xếp hạng hội viên:\n- Hạng Bạc (Silver): Giảm 5% tiền giờ\n- Hạng Vàng (Gold): Giảm 10% tiền giờ\n- Hạng Kim Cương (Diamond): Giảm 15% tiền giờ + Tích lũy 1 điểm cho mỗi 10.000đ`,
        suggestions: ['Báo cáo doanh thu hôm nay', 'Kiểm tra tồn kho đồ uống'],
        actionLink: isAdmin ? { tab: 'members', label: 'Quản lý Hội viên' } : undefined,
      };
    }

    // 6. Gợi ý tăng doanh thu / Combo
    if (q.includes('tăng doanh thu') || q.includes('chiến lược') || q.includes('combo') || q.includes('tối ưu')) {
      return {
        reply: `Đề xuất tối ưu kinh doanh cho câu lạc bộ:\n1. Combo Giờ Vàng (13:00 - 17:00): Chơi 2 giờ tặng 1 đồ uống hoặc giảm 15% để kéo khách khung giờ thấp điểm.\n2. Thúc đẩy F&B: Đặt menu món ăn nhanh (Mì xào, khô bò, khoai tây) ngay tại bảng điều khiển bàn để cơ thủ gọi thêm giữ chân khách.\n3. Thẻ hội viên: Tặng ưu đãi giờ chơi theo bậc thành viên để giữ chân khách quen.`,
        suggestions: ['Gợi ý combo giờ vàng', 'Báo cáo doanh thu hôm nay'],
      };
    }

    return {
      reply: `Tôi là Trợ lý AI Thanh Long. Bạn có thể hỏi tôi:\n- "Bao nhiêu bàn đang chơi?"\n- "Doanh thu hôm nay thế nào?"\n- "Đồ uống nào sắp hết hàng?"\n- "Bảng giá và ưu đãi hội viên"\n- "Gợi ý tăng doanh thu câu lạc bộ"`,
      suggestions: ['Bao nhiêu bàn đang chơi?', 'Doanh thu hôm nay thế nào?', 'Đồ uống sắp hết hàng'],
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const result = processAiResponse(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestions: result.suggestions,
        actionLink: result.actionLink,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-md select-none font-sans safe-area-pb">
      <div className="relative w-full max-w-2xl h-[640px] max-h-[94vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center tracking-tight shrink-0">
              AI
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  Trợ lý Vận hành AI
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/30 shrink-0">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Phân tích dữ liệu bàn chơi & doanh thu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all active:scale-95 shrink-0"
            title="Đóng cửa sổ Trợ lý AI"
          >
            ✕
          </button>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  {m.sender === 'user' ? 'Bạn' : 'Trợ lý AI'}
                </span>
                <span className="text-[10px] text-slate-400">{m.timestamp}</span>
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-sm shadow-sm'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-sm'
                }`}
              >
                {m.text}
              </div>

              {/* Action Button Link */}
              {m.actionLink && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      onNavigateTab(m.actionLink!.tab);
                      onClose();
                    }}
                    className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{m.actionLink.label}</span>
                  </button>
                </div>
              )}

              {/* Suggestions */}
              {m.suggestions && m.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                  {m.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/40 text-xs text-slate-400 w-36">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Đang tính toán...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi (Ví dụ: Doanh thu hôm nay, bàn nào đang chơi, món sắp hết...)"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 h-11 px-4 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-medium"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center transition-all whitespace-nowrap active:scale-[0.98]"
            >
              Gửi câu hỏi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

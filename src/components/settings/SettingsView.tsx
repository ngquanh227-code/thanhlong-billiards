import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PricingRule, TableItem, TableType } from '../../types';
import { formatVND } from '../../services/calculation';

export const SettingsView: React.FC = () => {
  const {
    tables,
    settings,
    pricingRules,
    theme,
    setTheme,
    addTable,
    updateTable,
    deleteTable,
    updateSettings,
    updatePricingRule,
    exportDatabaseJSON,
    importDatabaseJSON,
    resetAllDemoData,
  } = useApp();

  const [formSettings, setFormSettings] = useState(settings);

  // Table modal state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [tableForm, setTableForm] = useState({
    code: '',
    name: '',
    type: 'POOL' as TableType,
    hourlyRate: 60000,
    area: 'Khu Sảnh Lỗ',
    notes: '',
  });

  const handleOpenAddTable = () => {
    setEditingTable(null);
    const nextIndex = tables.length + 1;
    const padded = nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`;
    setTableForm({
      code: `Bàn ${padded}`,
      name: 'Bàn Bida Tiêu Chuẩn',
      type: 'POOL',
      hourlyRate: 60000,
      area: 'Khu Sảnh Lỗ',
      notes: '',
    });
    setIsTableModalOpen(true);
  };

  const handleOpenEditTable = (table: TableItem) => {
    setEditingTable(table);
    setTableForm({
      code: table.code,
      name: table.name,
      type: table.type,
      hourlyRate: table.hourlyRate,
      area: table.area,
      notes: table.notes || '',
    });
    setIsTableModalOpen(true);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableForm.code || !tableForm.name) return;

    if (editingTable) {
      updateTable({
        ...editingTable,
        code: tableForm.code,
        name: tableForm.name,
        type: tableForm.type,
        hourlyRate: tableForm.hourlyRate,
        area: tableForm.area,
        notes: tableForm.notes,
      });
    } else {
      addTable(tableForm);
    }
    setIsTableModalOpen(false);
  };

  const handleDeleteTable = (table: TableItem) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${table.code} - ${table.name}" khỏi danh sách bàn của quán?`)) {
      deleteTable(table.id);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
  };

  const handleSavePricing = (rule: PricingRule) => {
    updatePricingRule(rule);
  };

  const handleExportBackup = () => {
    const dataStr = exportDatabaseJSON();
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `thanh-long-billiards-backup-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-charcoal-800 text-gold-400 border border-charcoal-700">
              [HỆ THỐNG]
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight font-heading">
              Cài Đặt Hệ Thống & Quán
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Quản lý số lượng bàn, giao diện sáng/tối, bảng giá theo giờ và đồng bộ Supabase Cloud
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 text-xs font-mono font-semibold transition-colors"
          >
            <span className="text-gold-400 font-bold">[SAO LƯU]</span>
            <span>JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 text-xs font-mono font-semibold cursor-pointer transition-colors">
            <span className="text-emerald-400 font-bold">[NẠP LẠI]</span>
            <span>PHỤC HỒI</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* Row 1: Giao diện Sáng / Tối (Theme Mode) */}
      <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700">
              [GIAO DIỆN]
            </span>
            <span className="text-sm font-bold text-white font-heading">Chế Độ Hiển Thị</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-charcoal-800 text-slate-300 font-mono">
              {theme === 'dark' ? '● ĐANG BẬT TỐI' : '○ ĐANG BẬT SÁNG'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tùy chỉnh tông màu phù hợp với ánh sáng quán: Chế độ Tối dịu mắt cho ban đêm, Chế độ Sáng rõ nét cho ban ngày.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all ${
              theme === 'dark'
                ? 'bg-charcoal-700 text-white border border-charcoal-600 font-bold shadow-sm'
                : 'bg-charcoal-800/60 text-slate-400 hover:text-white border border-charcoal-750 font-medium'
            }`}
          >
            <span>[TỐI / DARK]</span>
            {theme === 'dark' && <span className="text-emerald-400 font-bold">●</span>}
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all ${
              theme === 'light'
                ? 'bg-charcoal-700 text-white border border-charcoal-600 font-bold shadow-sm'
                : 'bg-charcoal-800/60 text-slate-400 hover:text-white border border-charcoal-750 font-medium'
            }`}
          >
            <span>[SÁNG / LIGHT]</span>
            {theme === 'light' && <span className="text-emerald-400 font-bold">●</span>}
          </button>
        </div>
      </div>

      {/* Row 2: Quản lý số lượng bàn & danh sách bàn (Table Management) */}
      <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700">
                [DANH MỤC BÀN]
              </span>
              <h2 className="text-sm font-bold text-white font-heading">
                Quản Lý Danh Sách Bàn Của Quán
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                TỔNG {tables.length} BÀN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Thêm, sửa mã bàn, đổi giá giờ hoặc gỡ bỏ bàn theo quy mô thực tế của quán.
            </p>
          </div>

          <button
            onClick={handleOpenAddTable}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs transition-colors"
          >
            <span>+ THÊM BÀN MỚI</span>
          </button>
        </div>

        {/* Table list grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tables.map((tbl) => {
            const isPlaying = tbl.status === 'PLAYING';
            const isWaiting = tbl.status === 'WAITING_PAYMENT';

            return (
              <div
                key={tbl.id}
                className="p-3.5 rounded-lg bg-charcoal-900 border border-charcoal-800 flex items-center justify-between gap-3"
              >
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white font-mono">{tbl.code}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-charcoal-800 text-slate-400 uppercase font-mono">
                      {tbl.type}
                    </span>
                    {isPlaying ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ● ĐANG CHƠI
                      </span>
                    ) : isWaiting ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        ▲ CHỜ TÍNH
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-charcoal-800 text-slate-400">
                        ○ TRỐNG
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-300 truncate">{tbl.name}</span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                    <span className="text-gold-400 font-bold">{formatVND(tbl.hourlyRate)}/h</span>
                    <span>•</span>
                    <span className="truncate">{tbl.area}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEditTable(tbl)}
                    className="px-2.5 py-1.5 rounded bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 hover:text-white border border-charcoal-700 text-xs font-mono font-semibold transition-colors"
                    title="Chỉnh sửa thông tin bàn"
                  >
                    SỬA
                  </button>
                  <button
                    onClick={() => handleDeleteTable(tbl)}
                    className="px-2.5 py-1.5 rounded bg-charcoal-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-charcoal-700 text-xs font-mono font-semibold transition-colors"
                    title="Xóa bàn khỏi quán"
                  >
                    XÓA
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Grid 2 Columns (Thông tin quán & Cloud Sync) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. General Club Information */}
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono font-bold text-gold-400 px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700">
              [CƠ SỞ]
            </span>
            <h3 className="text-sm font-bold text-white font-heading">
              Thông Tin Quán & Hóa Đơn POS
            </h3>
          </div>

          <form onSubmit={handleSaveSettings} className="flex flex-col gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Tên thương hiệu câu lạc bộ:</label>
              <input
                type="text"
                value={formSettings.clubName}
                onChange={(e) => setFormSettings({ ...formSettings, clubName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Số điện thoại hotline:</label>
                <input
                  type="text"
                  value={formSettings.phone}
                  onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-mono focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Mật khẩu Wi-Fi cho khách:</label>
                <input
                  type="text"
                  value={formSettings.wifiPassword}
                  onChange={(e) => setFormSettings({ ...formSettings, wifiPassword: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-mono focus:outline-none focus:border-charcoal-600"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Địa chỉ quán:</label>
              <input
                type="text"
                value={formSettings.address}
                onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
              />
            </div>

            {/* Bank VietQR */}
            <div className="pt-2 border-t border-charcoal-800 flex flex-col gap-2">
              <span className="text-slate-400 font-mono font-bold text-[11px] uppercase tracking-wider">
                [TÀI KHOẢN NHẬN CHUYỂN KHOẢN VIETQR]
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-0.5">Ngân Hàng:</label>
                  <input
                    type="text"
                    value={formSettings.bankName}
                    onChange={(e) => setFormSettings({ ...formSettings, bankName: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-0.5">Số Tài Khoản:</label>
                  <input
                    type="text"
                    value={formSettings.bankAccountNo}
                    onChange={(e) => setFormSettings({ ...formSettings, bankAccountNo: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-mono font-bold text-gold-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-0.5">Chủ Tài Khoản:</label>
                  <input
                    type="text"
                    value={formSettings.bankAccountName}
                    onChange={(e) => setFormSettings({ ...formSettings, bankAccountName: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white uppercase font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs transition-colors"
              >
                LƯU CẤU HÌNH QUÁN
              </button>
            </div>
          </form>
        </div>

        {/* 2. Supabase Cloud Sync Configuration */}
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700">
                  [CLOUD SYNC]
                </span>
                <h3 className="text-sm font-bold text-white font-heading">
                  Đồng Bộ Dữ Liệu Supabase
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                formSettings.isCloudSyncEnabled
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'bg-charcoal-800 text-slate-400'
              }`}>
                {formSettings.isCloudSyncEnabled ? '● ĐANG BẬT' : '○ TẮT (OFFLINE)'}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Hệ thống đang hoạt động với cơ sở dữ liệu nội bộ bảo mật cao (Offline-First). Bạn có thể kết nối dự án Supabase để đồng bộ nhiều thiết bị máy tính, iPad và điện thoại.
            </p>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Supabase Project URL:</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={formSettings.supabaseUrl || ''}
                  onChange={(e) => setFormSettings({ ...formSettings, supabaseUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-mono focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Supabase Anon Public API Key:</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={formSettings.supabaseAnonKey || ''}
                  onChange={(e) => setFormSettings({ ...formSettings, supabaseAnonKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-mono focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="enableCloudSync"
                  checked={formSettings.isCloudSyncEnabled}
                  onChange={(e) => setFormSettings({ ...formSettings, isCloudSyncEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="enableCloudSync" className="text-slate-300 cursor-pointer font-medium text-xs">
                  Kích hoạt đồng bộ hóa trên đám mây (Cloud Sync)
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-charcoal-800 flex justify-between items-center mt-4">
            <button
              onClick={() => {
                if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu (6 bàn bida, các bàn đang chơi và menu)?')) {
                  resetAllDemoData();
                }
              }}
              className="px-3 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-mono font-semibold transition-colors"
            >
              [RESET] DỮ LIỆU GỐC
            </button>

            <button
              onClick={() => updateSettings(formSettings)}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs transition-colors"
            >
              LƯU KẾT NỐI CLOUD
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Pricing Rules for Table Types */}
      <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700">
            [BẢNG GIÁ]
          </span>
          <h3 className="text-sm font-bold text-white font-heading">
            Biểu Phí Giờ Chơi Từng Loại Bàn (Pool, Carom, VIP, Snooker)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Giá chơi được chốt cố định theo từng lượt chơi để đảm bảo không làm thay đổi các hóa đơn cũ khi cập nhật giá.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pricingRules.map((rule) => (
            <div
              key={rule.type}
              className="p-3.5 rounded-lg bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{rule.typeName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 text-slate-400 uppercase font-mono">
                  {rule.type}
                </span>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-0.5">Giá thường ngày (đ/h):</label>
                  <input
                    type="number"
                    step="5000"
                    value={rule.defaultHourlyRate}
                    onChange={(e) => {
                      const updated = { ...rule, defaultHourlyRate: Number(e.target.value) };
                      handleSavePricing(updated);
                    }}
                    className="w-full px-2 py-1 rounded bg-charcoal-800 border border-charcoal-700 text-white font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-0.5">Giá giờ cao điểm (đ/h):</label>
                  <input
                    type="number"
                    step="5000"
                    value={rule.peakHourRate}
                    onChange={(e) => {
                      const updated = { ...rule, peakHourRate: Number(e.target.value) };
                      handleSavePricing(updated);
                    }}
                    className="w-full px-2 py-1 rounded bg-charcoal-800 border border-charcoal-700 text-gold-400 font-mono font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Tối thiểu (phút):</label>
                    <input
                      type="number"
                      value={rule.minimumMinutes}
                      onChange={(e) => {
                        const updated = { ...rule, minimumMinutes: Number(e.target.value) };
                        handleSavePricing(updated);
                      }}
                      className="w-full px-2 py-1 rounded bg-charcoal-800 border border-charcoal-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Làm tròn (phút):</label>
                    <select
                      value={rule.roundingMinutes}
                      onChange={(e) => {
                        const updated = { ...rule, roundingMinutes: Number(e.target.value) as any };
                        handleSavePricing(updated);
                      }}
                      className="w-full px-2 py-1 rounded bg-charcoal-800 border border-charcoal-700 text-white font-mono"
                    >
                      <option value="1">1 phút</option>
                      <option value="5">5 phút</option>
                      <option value="10">10 phút</option>
                      <option value="15">15 phút</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Thêm / Sửa Bàn */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-charcoal-900 border border-charcoal-750 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <h3 className="text-base font-bold text-white font-heading">
                {editingTable ? `Chỉnh Sửa ${editingTable.code}` : 'Thêm Bàn Mới Cho Quán'}
              </h3>
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-charcoal-800 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Mã bàn:</label>
                  <input
                    type="text"
                    required
                    placeholder="Bàn 01, VIP 02..."
                    value={tableForm.code}
                    onChange={(e) => setTableForm({ ...tableForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-medium focus:outline-none focus:border-charcoal-600"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Loại bàn:</label>
                  <select
                    value={tableForm.type}
                    onChange={(e) => {
                      const newType = e.target.value as TableType;
                      const matchedRule = pricingRules.find((r) => r.type === newType);
                      setTableForm({
                        ...tableForm,
                        type: newType,
                        hourlyRate: matchedRule ? matchedRule.defaultHourlyRate : tableForm.hourlyRate,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                  >
                    <option value="POOL">Pool (Bàn Lỗ)</option>
                    <option value="CAROM">Carom (Pháp / 3C)</option>
                    <option value="VIP">VIP (Phòng Riêng)</option>
                    <option value="SNOOKER">Snooker</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Tên thương hiệu / Model bàn:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Aileex 9020 Silver, Hollywood Pro..."
                  value={tableForm.name}
                  onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Giá tính theo giờ (VNĐ):</label>
                  <input
                    type="number"
                    step="5000"
                    required
                    value={tableForm.hourlyRate}
                    onChange={(e) => setTableForm({ ...tableForm, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gold-400 font-mono font-medium focus:outline-none focus:border-charcoal-600"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Khu vực / Tầng:</label>
                  <input
                    type="text"
                    required
                    placeholder="Khu Sảnh Lỗ, Lầu 1..."
                    value={tableForm.area}
                    onChange={(e) => setTableForm({ ...tableForm, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Ghi chú bàn (tùy chọn):</label>
                <input
                  type="text"
                  placeholder="Vải Simonis mới thay, cơ Fury..."
                  value={tableForm.notes}
                  onChange={(e) => setTableForm({ ...tableForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                >
                  {editingTable ? 'Lưu Thay Đổi' : 'Thêm Bàn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

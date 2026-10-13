import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PricingRule, TableItem, TableType } from '../../types';
import { formatVND } from '../../services/calculation';

export const SettingsView: React.FC = () => {
  const {
    isAdmin,
    tables,
    settings,
    pricingRules,
    theme,
    setTheme,
    soundEnabled,
    toggleSound,
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
    if (!isAdmin) return;
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
    if (!isAdmin) return;
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
    if (!isAdmin) return;
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
    if (!isAdmin) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${table.code} - ${table.name}" khỏi danh sách bàn của quán?`)) {
      deleteTable(table.id);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    updateSettings(formSettings);
  };

  const handleSavePricing = (rule: PricingRule) => {
    if (!isAdmin) return;
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
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Cài đặt hệ thống
            </h1>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
              isAdmin
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
            }`}>
              {isAdmin ? 'Quản trị viên' : 'Nhân viên'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin
              ? 'Quản lý toàn diện: tùy chỉnh hiển thị, quy mô bàn, biểu phí và đồng bộ dữ liệu.'
              : 'Tùy chỉnh giao diện, âm thanh và tra cứu thông tin quán. Chức năng nâng cao yêu cầu quyền Quản trị viên.'}
          </p>
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-colors"
            >
              <span>Sao lưu dữ liệu</span>
            </button>

            <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium cursor-pointer transition-colors">
              <span>Khôi phục JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-medium px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
            Chế độ nhân viên
          </div>
        )}
      </div>

      {/* Row 1: Giao diện Sáng / Tối (Theme Mode) & Âm thanh hệ thống */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Theme Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-white">Chế độ hiển thị</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                {theme === 'dark' ? 'Giao diện tối' : 'Giao diện sáng'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tùy chỉnh tông màu: Tối dịu mắt ban đêm hoặc Sáng rõ nét ban ngày.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 h-9 rounded-lg text-xs transition-all flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 font-medium'
              }`}
            >
              Tối (Dark)
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`flex-1 h-9 rounded-lg text-xs transition-all flex items-center justify-center ${
                theme === 'light'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 font-medium'
              }`}
            >
              Sáng (Light)
            </button>
          </div>
        </div>

        {/* Sound Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-white">Âm thanh hệ thống</span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                soundEnabled ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {soundEnabled ? 'Đang bật' : 'Đang tắt'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Phát hiệu ứng âm thanh click, mở bàn, hoàn thành hóa đơn và chuông cảnh báo.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={toggleSound}
              className={`flex-1 h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                soundEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60'
              }`}
            >
              {soundEnabled ? 'Bật âm thanh' : 'Tắt âm thanh'}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Quản lý số lượng bàn & danh sách bàn (Table Management) */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-semibold text-white">
                Danh mục bàn câu lạc bộ
              </h2>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                {tables.length} bàn
              </span>
              {!isAdmin && (
                <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                  Chỉ xem
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAdmin
                ? 'Thêm, sửa mã bàn, đổi giá giờ hoặc gỡ bỏ bàn theo quy mô thực tế của quán.'
                : 'Xem danh sách bàn và đơn giá niêm yết. Quyền thêm, sửa hoặc xóa bàn yêu cầu tài khoản Quản trị viên.'}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddTable}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
            >
              <span>+ Thêm bàn mới</span>
            </button>
          )}
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

                {isAdmin && (
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
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Grid 2 Columns (Thông tin quán & Cloud Sync) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. General Club Information */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Thông tin quán & Hóa đơn thanh toán
            </h3>
            {!isAdmin && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                Chỉ xem
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="flex flex-col gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Tên thương hiệu câu lạc bộ:</label>
              <input
                type="text"
                readOnly={!isAdmin}
                value={formSettings.clubName}
                onChange={(e) => setFormSettings({ ...formSettings, clubName: e.target.value })}
                className={`w-full px-3.5 py-2 rounded-xl border text-white font-medium ${
                  isAdmin
                    ? 'bg-slate-800/60 border-slate-700/80 focus:outline-none focus:border-slate-500'
                    : 'bg-slate-800/30 border-slate-800 text-slate-300 cursor-default'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Số điện thoại hotline:</label>
                <input
                  type="text"
                  readOnly={!isAdmin}
                  value={formSettings.phone}
                  onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border text-white ${
                    isAdmin
                      ? 'bg-slate-800/60 border-slate-700/80 focus:outline-none focus:border-slate-500'
                      : 'bg-slate-800/30 border-slate-800 text-slate-300 cursor-default'
                  }`}
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Mật khẩu Wi-Fi cho khách:</label>
                <input
                  type="text"
                  readOnly={!isAdmin}
                  value={formSettings.wifiPassword}
                  onChange={(e) => setFormSettings({ ...formSettings, wifiPassword: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border text-white ${
                    isAdmin
                      ? 'bg-slate-800/60 border-slate-700/80 focus:outline-none focus:border-slate-500'
                      : 'bg-slate-800/30 border-slate-800 text-slate-300 cursor-default'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Địa chỉ quán:</label>
              <input
                type="text"
                readOnly={!isAdmin}
                value={formSettings.address}
                onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                className={`w-full px-3.5 py-2 rounded-xl border text-white ${
                  isAdmin
                    ? 'bg-slate-800/60 border-slate-700/80 focus:outline-none focus:border-slate-500'
                    : 'bg-slate-800/30 border-slate-800 text-slate-300 cursor-default'
                }`}
              />
            </div>

            {/* Bank VietQR */}
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              <span className="text-slate-300 font-semibold text-xs">
                Tài khoản nhận chuyển khoản VietQR
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Ngân hàng:</label>
                  <input
                    type="text"
                    readOnly={!isAdmin}
                    value={formSettings.bankName}
                    onChange={(e) => setFormSettings({ ...formSettings, bankName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border font-medium ${
                      isAdmin
                        ? 'bg-slate-800/60 border-slate-700/80 text-white'
                        : 'bg-slate-800/30 border-slate-800 text-slate-300 cursor-default'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Số tài khoản:</label>
                  <input
                    type="text"
                    readOnly={!isAdmin}
                    value={formSettings.bankAccountNo}
                    onChange={(e) => setFormSettings({ ...formSettings, bankAccountNo: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border font-semibold ${
                      isAdmin
                        ? 'bg-slate-800/60 border-slate-700/80 text-amber-300'
                        : 'bg-slate-800/30 border-slate-800 text-amber-300/80 cursor-default'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Chủ tài khoản:</label>
                  <input
                    type="text"
                    readOnly={!isAdmin}
                    value={formSettings.bankAccountName}
                    onChange={(e) => setFormSettings({ ...formSettings, bankAccountName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border uppercase font-medium ${
                      isAdmin
                        ? 'bg-slate-800/60 border-slate-700/80 text-white'
                        : 'bg-slate-800/30 border-slate-800 text-slate-300 cursor-default'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              {isAdmin ? (
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                >
                  Lưu cấu hình quán
                </button>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Thông tin dùng để in hóa đơn & hướng dẫn khách chuyển khoản.
                </span>
              )}
            </div>
          </form>
        </div>

        {/* 2. Supabase Cloud Sync Configuration */}
        {isAdmin ? (
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">
                  Đồng bộ dữ liệu trực tuyến
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                  formSettings.isCloudSyncEnabled
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {formSettings.isCloudSyncEnabled ? 'Đang bật' : 'Chế độ ngoại tuyến'}
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/80 text-white focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Supabase Anon Public API Key:</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={formSettings.supabaseAnonKey || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, supabaseAnonKey: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/80 text-white focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div className="flex items-center gap-2.5 mt-1">
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

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center mt-4">
              <button
                onClick={() => {
                  if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu (6 bàn bida, các bàn đang chơi và menu)?')) {
                    resetAllDemoData();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/30 text-rose-300 text-xs font-medium transition-colors"
              >
                Khôi phục dữ liệu gốc
              </button>

              <button
                onClick={() => updateSettings(formSettings)}
                className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-medium text-xs transition-colors"
              >
                Lưu kết nối Cloud
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">
                  Đồng bộ dữ liệu & Máy chủ
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Nâng cao (Chỉ Admin)
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Hệ thống đang hoạt động với cơ sở dữ liệu nội bộ bảo mật cao (Offline-First). Tính năng liên kết đám mây Supabase đa thiết bị và khôi phục dữ liệu gốc là quyền hạn của Quản trị viên.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Trạng thái lưu trữ:</span>
                  <span className="text-emerald-400 font-medium">Bảo mật nội bộ an toàn</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Đồng bộ đa thiết bị:</span>
                  <span className="text-slate-300 font-medium">
                    {formSettings.isCloudSyncEnabled ? 'Đang kích hoạt' : 'Ngoại tuyến (Offline)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
              Vui lòng chuyển sang tài khoản Quản trị viên để cấu hình kết nối đám mây.
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Pricing Rules for Table Types */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-sm font-semibold text-white">
            Biểu phí giờ chơi theo loại bàn (Pool, Carom, VIP, Snooker)
          </h3>
          {!isAdmin && (
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
              Chỉ xem
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mb-4">
          {isAdmin
            ? 'Giá chơi được chốt cố định theo từng lượt chơi để đảm bảo không làm thay đổi các hóa đơn cũ khi cập nhật giá.'
            : 'Đơn giá niêm yết theo loại bàn. Quyền điều chỉnh biểu phí giờ chơi yêu cầu tài khoản Quản trị viên.'}
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
                    disabled={!isAdmin}
                    value={rule.defaultHourlyRate}
                    onChange={(e) => {
                      if (!isAdmin) return;
                      const updated = { ...rule, defaultHourlyRate: Number(e.target.value) };
                      handleSavePricing(updated);
                    }}
                    className={`w-full px-2 py-1 rounded border font-mono font-medium ${
                      isAdmin
                        ? 'bg-charcoal-800 border-charcoal-700 text-white'
                        : 'bg-charcoal-850 border-charcoal-800 text-slate-300 cursor-default'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-0.5">Giá giờ cao điểm (đ/h):</label>
                  <input
                    type="number"
                    step="5000"
                    disabled={!isAdmin}
                    value={rule.peakHourRate}
                    onChange={(e) => {
                      if (!isAdmin) return;
                      const updated = { ...rule, peakHourRate: Number(e.target.value) };
                      handleSavePricing(updated);
                    }}
                    className={`w-full px-2 py-1 rounded border font-mono font-medium ${
                      isAdmin
                        ? 'bg-charcoal-800 border-charcoal-700 text-gold-400'
                        : 'bg-charcoal-850 border-charcoal-800 text-gold-400/80 cursor-default'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Tối thiểu (phút):</label>
                    <input
                      type="number"
                      disabled={!isAdmin}
                      value={rule.minimumMinutes}
                      onChange={(e) => {
                        if (!isAdmin) return;
                        const updated = { ...rule, minimumMinutes: Number(e.target.value) };
                        handleSavePricing(updated);
                      }}
                      className={`w-full px-2 py-1 rounded border font-mono ${
                        isAdmin
                          ? 'bg-charcoal-800 border-charcoal-700 text-white'
                          : 'bg-charcoal-850 border-charcoal-800 text-slate-300 cursor-default'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Làm tròn (phút):</label>
                    <select
                      disabled={!isAdmin}
                      value={rule.roundingMinutes}
                      onChange={(e) => {
                        if (!isAdmin) return;
                        const updated = { ...rule, roundingMinutes: Number(e.target.value) as any };
                        handleSavePricing(updated);
                      }}
                      className={`w-full px-2 py-1 rounded border font-mono ${
                        isAdmin
                          ? 'bg-charcoal-800 border-charcoal-700 text-white'
                          : 'bg-charcoal-850 border-charcoal-800 text-slate-300 cursor-default'
                      }`}
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

      {/* Modal: Thêm / Sửa Bàn (Admin Only) */}
      {isTableModalOpen && isAdmin && (
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

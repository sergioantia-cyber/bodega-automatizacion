import React, { useState } from 'react';
import { X, Palette, Store, Phone, MapPin, Clock, Check, Sparkles, RefreshCw, ShoppingCart } from 'lucide-react';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { StoreProfile, StoreBrandTheme, ThemePresetId } from '../types';
import { storageService } from '../services/storageService';
import { themeService, BRAND_PRESETS } from '../services/themeService';
import { soundService } from '../services/soundService';
import { BODEGA_CONFIG } from '../config/bodegaConfig';

interface BrandCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updated: StoreProfile) => void;
}

const EMOJI_OPTIONS = ['🏪', '🛒', '🍎', '🥖', '🥩', '💊', '🍺', '📦', '⚡', '🍕', '🍦', '☕'];
const CURRENCY_OPTIONS = [
  { symbol: 'S/', label: 'Soles (Perú)' },
  { symbol: '$', label: 'Dólares / Pesos' },
  { symbol: '€', label: 'Euros' },
  { symbol: 'Bs', label: 'Bolivianos' },
  { symbol: 'Q', label: 'Quetzales' },
  { symbol: '₡', label: 'Colones' }
];

export const BrandCustomizerModal: React.FC<BrandCustomizerModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const current = storageService.getStoreProfile();

  const [name, setName] = useState(current.name);
  const [slogan, setSlogan] = useState(current.slogan || 'Tu tienda de confianza en el barrio');
  const [iconEmoji, setIconEmoji] = useState(current.iconEmoji || '🏪');
  const [currencySymbol, setCurrencySymbol] = useState(current.currencySymbol || 'S/');
  const [whatsappNumber, setWhatsappNumber] = useState(current.whatsappNumber);
  const [phoneDisplay, setPhoneDisplay] = useState(current.phoneDisplay);
  const [address, setAddress] = useState(current.address);
  const [schedule, setSchedule] = useState(current.schedule);

  // Tema activo
  const [theme, setTheme] = useState<StoreBrandTheme>(current.theme || {
    presetId: 'yellow',
    primaryColor: '#FFE600',
    secondaryColor: '#D2FF00',
    accentColor: '#FF5C38',
    cyanColor: '#00F0FF'
  });

  const [isCustomColors, setIsCustomColors] = useState(theme.presetId === 'custom');
  const [activeTab, setActiveTab] = useState<'visual' | 'info'>('visual');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Cambiar a preset
  const handleSelectPreset = (presetId: ThemePresetId) => {
    const preset = BRAND_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const newTheme: StoreBrandTheme = {
      presetId,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      cyanColor: preset.cyanColor
    };

    setTheme(newTheme);
    setIsCustomColors(false);
    themeService.applyTheme(newTheme);
    soundService.playPop();
  };

  // Cambiar color personalizado
  const handleCustomColorChange = (key: keyof Omit<StoreBrandTheme, 'presetId'>, color: string) => {
    const newTheme: StoreBrandTheme = {
      ...theme,
      presetId: 'custom',
      [key]: color
    };
    setTheme(newTheme);
    setIsCustomColors(true);
    themeService.applyTheme(newTheme);
  };

  // Restablecer valores de fábrica
  const handleResetDefaults = () => {
    setName(BODEGA_CONFIG.name);
    setSlogan(BODEGA_CONFIG.slogan);
    setIconEmoji(BODEGA_CONFIG.iconEmoji);
    setCurrencySymbol(BODEGA_CONFIG.currencySymbol);
    setWhatsappNumber(BODEGA_CONFIG.whatsappNumber);
    setPhoneDisplay(BODEGA_CONFIG.phoneDisplay);
    setAddress(BODEGA_CONFIG.address);
    setSchedule(BODEGA_CONFIG.schedule);
    setTheme(BODEGA_CONFIG.theme);
    setIsCustomColors(false);
    themeService.applyTheme(BODEGA_CONFIG.theme);
    soundService.playWarning();
  };

  // Guardar y aplicar permanentemente
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

    const updatedProfile: StoreProfile = storageService.saveStoreProfile({
      name: name.trim() || 'Mi Establecimiento',
      slogan: slogan.trim() || 'Tu tienda de confianza',
      iconEmoji: iconEmoji || '🏪',
      currencySymbol: currencySymbol || 'S/',
      whatsappNumber: cleanPhone || '51987654321',
      phoneDisplay: phoneDisplay.trim() || whatsappNumber,
      address: address.trim() || 'Dirección no especificada',
      schedule: schedule.trim() || 'Lunes a Domingo: 7:00 AM - 11:00 PM',
      theme
    });

    themeService.applyTheme(theme);
    soundService.playSuccessChime();
    setSavedSuccess(true);

    if (onProfileUpdated) {
      onProfileUpdated(updatedProfile);
    }

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg my-auto">
        <TactileCard className="border-4 border-slate-950 shadow-tactile-lg max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900">
          
          {/* Header Superior con Degradado Neo-Brutal */}
          <div className="p-4 border-b-2 border-slate-900 bg-bogad-yellow flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 shadow-tactile-sm flex items-center justify-center text-xl shrink-0">
                <Palette className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white border border-slate-900 rounded">
                    SaaS Marca Blanca
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-950 tracking-tight leading-none mt-0.5">
                  Personalizar Marca & Colores
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 active:translate-y-0.5 shadow-tactile-sm transition-all"
            >
              <X className="w-5 h-5 text-slate-900 stroke-[2.5]" />
            </button>
          </div>

          {/* Sub-tabs de Navegación del Personalizador */}
          <div className="flex border-b-2 border-slate-900 bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={`flex-1 py-2 px-3 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'visual'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white border-2 border-slate-900 shadow-tactile-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Colores & Identidad</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2 px-3 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'info'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white border-2 border-slate-900 shadow-tactile-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>WhatsApp & Sucursal</span>
            </button>
          </div>

          {/* Formulario Principal con Scroll */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(92vh-180px)]">
            
            {savedSuccess && (
              <div className="p-3 bg-bogad-lime/30 border-2 border-slate-900 rounded-xl flex items-center gap-2 text-slate-950 font-black text-xs shadow-tactile-sm animate-bounce">
                <Check className="w-5 h-5 text-emerald-700 stroke-[3]" />
                <span>¡Marca y colores guardados exitosamente!</span>
              </div>
            )}

            {/* VISTA PREVIA EN VIVO (LIVE PREVIEW) */}
            <div className="p-3.5 rounded-2xl border-2 border-slate-900 bg-slate-50 dark:bg-slate-800/80 shadow-tactile-sm space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-bogad-yellow fill-bogad-yellow" />
                  <span>Vista Previa en Tiempo Real</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {isCustomColors ? 'Modo Personalizado' : `Preset: ${theme.presetId.toUpperCase()}`}
                </span>
              </div>

              {/* Maqueta de Cabecera Mini */}
              <div
                style={{ backgroundColor: theme.primaryColor }}
                className="p-3 rounded-xl border-2 border-slate-900 shadow-tactile-sm transition-colors duration-150 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white border-2 border-slate-900 flex items-center justify-center text-base shadow-tactile-sm">
                    {iconEmoji}
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-950 leading-tight">
                      {name || 'Mi Establecimiento'}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-800 line-clamp-1">
                      {slogan}
                    </p>
                  </div>
                </div>

                <div
                  style={{ backgroundColor: theme.secondaryColor }}
                  className="px-2 py-1 rounded-lg border-2 border-slate-900 text-[10px] font-black text-slate-950 flex items-center gap-1 shadow-tactile-sm"
                >
                  <ShoppingCart className="w-3 h-3" />
                  <span>3</span>
                </div>
              </div>

              {/* Maqueta de Botón de Acción */}
              <div className="flex gap-2">
                <div
                  style={{ backgroundColor: theme.secondaryColor }}
                  className="flex-1 py-1.5 rounded-lg border-2 border-slate-900 text-center text-[10px] font-black text-slate-950 shadow-tactile-sm"
                >
                  {currencySymbol} 15.50 • Pedir
                </div>
                <div
                  style={{ backgroundColor: theme.accentColor }}
                  className="px-3 py-1.5 rounded-lg border-2 border-slate-900 text-center text-[10px] font-black text-white shadow-tactile-sm"
                >
                  Alerta
                </div>
              </div>
            </div>

            {/* PESTAÑA 1: COLORES & IDENTIDAD */}
            {activeTab === 'visual' && (
              <div className="space-y-4">
                
                {/* 1. Nombre de la Tienda */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase flex items-center justify-between">
                    <span>Nombre del Establecimiento</span>
                    <span className="text-slate-400 font-normal text-[10px]">Aparece en toda la app</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Minimarket Doña Chela / Farmacia Santa Ana"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-yellow shadow-tactile-sm"
                  />
                </div>

                {/* 2. Eslogan */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase">
                    Eslogan o Giro del Negocio
                  </label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    placeholder="Ej. Abarrotes, Verduras y Delivery al Instante"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-yellow shadow-tactile-sm"
                  />
                </div>

                {/* 3. Icono / Emoji del Rubro */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase">
                    Icono / Rubro del Establecimiento
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setIconEmoji(emoji);
                          soundService.playPop();
                        }}
                        className={`py-2 text-lg rounded-xl border-2 transition-all flex items-center justify-center ${
                          iconEmoji === emoji
                            ? 'bg-bogad-yellow border-slate-950 shadow-tactile-sm -translate-y-0.5'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Selector de Moneda */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase">
                    Símbolo de Moneda
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CURRENCY_OPTIONS.map((c) => (
                      <button
                        key={c.symbol}
                        type="button"
                        onClick={() => {
                          setCurrencySymbol(c.symbol);
                          soundService.playPop();
                        }}
                        className={`py-1.5 px-2 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          currencySymbol === c.symbol
                            ? 'bg-bogad-lime border-slate-950 text-slate-950 font-black shadow-tactile-sm -translate-y-0.5'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-900 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-mono font-black">{c.symbol}</span>
                        <span className="text-[10px] truncate">{c.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. PALETAS DE COLORES PREDEFINIDAS */}
                <div className="space-y-2 pt-2 border-t-2 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 dark:text-white uppercase flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Paleta de Colores de la Marca</span>
                    </label>
                    <span className="text-[10px] font-bold text-slate-500">6 Presets Profesionales</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {BRAND_PRESETS.map((p) => {
                      const isSelected = !isCustomColors && theme.presetId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPreset(p.id)}
                          className={`p-2 rounded-xl border-2 text-left transition-all relative ${
                            isSelected
                              ? 'border-slate-950 bg-white dark:bg-slate-800 shadow-tactile -translate-y-0.5 ring-2 ring-slate-950'
                              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-900'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                              ✓
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span
                              className="w-4 h-4 rounded-full border border-slate-900 shadow-sm"
                              style={{ backgroundColor: p.primaryColor }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-slate-900 shadow-sm"
                              style={{ backgroundColor: p.secondaryColor }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-slate-900 shadow-sm"
                              style={{ backgroundColor: p.accentColor }}
                            />
                          </div>
                          <p className="text-xs font-black text-slate-950 dark:text-white leading-tight">
                            {p.name}
                          </p>
                          <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                            {p.tagline}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. SELECTOR DE COLORES PERSONALIZADO */}
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">
                      Colores Personalizados (Hexadecimal)
                    </span>
                    {isCustomColors && (
                      <span className="text-[10px] font-black text-bogad-coral uppercase">
                        Modo Custom Activo
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Color Primario */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block truncate">
                        Primario (Principal)
                      </span>
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-900">
                        <input
                          type="color"
                          value={theme.primaryColor}
                          onChange={(e) => handleCustomColorChange('primaryColor', e.target.value)}
                          className="w-6 h-6 rounded border-0 cursor-pointer p-0"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase">
                          {theme.primaryColor}
                        </span>
                      </div>
                    </div>

                    {/* Color Secundario */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block truncate">
                        Secundario (Botones)
                      </span>
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-900">
                        <input
                          type="color"
                          value={theme.secondaryColor}
                          onChange={(e) => handleCustomColorChange('secondaryColor', e.target.value)}
                          className="w-6 h-6 rounded border-0 cursor-pointer p-0"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase">
                          {theme.secondaryColor}
                        </span>
                      </div>
                    </div>

                    {/* Color Acento */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block truncate">
                        Acento (Alertas)
                      </span>
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-900">
                        <input
                          type="color"
                          value={theme.accentColor}
                          onChange={(e) => handleCustomColorChange('accentColor', e.target.value)}
                          className="w-6 h-6 rounded border-0 cursor-pointer p-0"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase">
                          {theme.accentColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* PESTAÑA 2: WHATSAPP & SUCURSAL */}
            {activeTab === 'info' && (
              <div className="space-y-3">
                {/* WhatsApp Receptor */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase flex items-center justify-between">
                    <span>Número de WhatsApp para Pedidos</span>
                    <span className="text-bogad-coral text-[10px] font-black">*OBLIGATORIO</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="51987654321"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-lime shadow-tactile-sm"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500">
                    Incluye el código de país sin '+'. Ej: 51 para Perú (51987654321), 521 para México, 57 para Colombia.
                  </p>
                </div>

                {/* Formato visual */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase">
                    Teléfono Visible para Clientes (Formato decorativo)
                  </label>
                  <input
                    type="text"
                    value={phoneDisplay}
                    onChange={(e) => setPhoneDisplay(e.target.value)}
                    placeholder="+51 987 654 321"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-yellow shadow-tactile-sm"
                  />
                </div>

                {/* Dirección */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase">
                    Dirección Física del Local
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Av. Los Laureles 342, Esquina Central"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-yellow shadow-tactile-sm"
                    />
                  </div>
                </div>

                {/* Horario */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase">
                    Horario de Atención
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      placeholder="Lunes a Domingo: 7:00 AM - 11:00 PM"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-yellow shadow-tactile-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BOTONES DE ACCIÓN */}
            <div className="pt-2 flex items-center gap-2 border-t-2 border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="p-2.5 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-tactile-sm flex items-center gap-1 active:translate-y-0.5"
                title="Restablecer a valores de fábrica"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restablecer</span>
              </button>

              <TactileButton
                type="button"
                variant="outline"
                size="md"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </TactileButton>

              <TactileButton
                type="submit"
                variant="primary"
                size="md"
                className="flex-[1.5] flex items-center justify-center gap-1.5 bg-bogad-lime hover:bg-bogad-lime/90 text-slate-950 font-black shadow-tactile-sm"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Guardar Marca</span>
              </TactileButton>
            </div>

          </form>

        </TactileCard>
      </div>
    </div>
  );
};

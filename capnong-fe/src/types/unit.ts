// ─── Unit Types (khớp API Contract: UnitResponse) ───

export type UnitCategory = "WEIGHT" | "VOLUME" | "COUNT" | "PACKAGING";

export interface UnitResponse {
  code: string;           // KG, TAN, TA, YEN, TRAI, HOP, etc.
  display_name: string;   // "Kilogram", "Tấn", ...
  symbol: string;         // "kg", "tấn", ...
  base_unit: string | null; // null = đơn vị gốc
  conversion_factor: number; // 1 unit = X * base_unit (e.g. 1 tạ = 100 kg)
  category: UnitCategory;
  aliases: string[];      // ["ky", "ki", "kilogam"] — for Voice extract
}

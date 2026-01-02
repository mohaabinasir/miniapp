import CryptoJS from 'crypto-js'

export interface User {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code: string;
    allows_write_to_pm: boolean;
    photo_url?: string;
}

interface Fields {
    query_id: string;
    user: string;
    auth_date: string;
    signature: string;
}

export default function makeInitData(botToken: string = '4839574812:AAFD39kkdpWt3ywyRZergyOLMaJhac60qc', webUrl: string) {

  const userData = JSON.parse(localStorage.getItem('__tg_user') || '{}');
  
  const user: User = {
    id: userData.id || 1234567890,
    first_name: userData.first_name || "Test",
    last_name: userData.last_name || "User",
    username: userData.username || "test_user",
    language_code: userData.language_code || "en",
    allows_write_to_pm: true,
    photo_url: userData.photo_url || "",
  };

  const query_id: string = "AAGTxYhxAwAAAJPFiHGWuU3c";
  const auth_date: number = Math.floor(Date.now() / 1000);
  const signature: string = "Rxyyhytg35hrse8jc73HC53y97gh5g95bons47jbr4d864";

  const fields: Fields = {
    query_id,
    user: JSON.stringify(user),
    auth_date: String(auth_date),
    signature,
  };

  const sortedKeys = Object.keys(fields).sort() as (keyof Fields)[]
  const dataCheckString = sortedKeys.map((k) => `${k}=${fields[k]}`).join("\n");

  const secretKey = CryptoJS.HmacSHA256(botToken, "WebAppData");
  const hash = CryptoJS.HmacSHA256(dataCheckString, secretKey).toString(CryptoJS.enc.Hex);

  const encodedParts = sortedKeys.map((k) => `${k}=${encodeURIComponent(fields[k])}`);
  encodedParts.push(`hash=${hash}`);
  const init_data = encodedParts.join("&");

  const themeParams = {
    bg_color: "#212121",
    button_color: "#007bff",
    button_text_color: "#ffffff",
    hint_color: "#aaaaaa",
    link_color: "#007bff",
    secondary_bg_color: "#181818",
    text_color: "#ffffff",
    header_bg_color: "#212121",
    accent_text_color: "#007bff",
    section_bg_color: "#212121",
    section_header_text_color: "#007bff",
    subtitle_text_color: "#aaaaaa",
    destructive_text_color: "#ff595a",    
    bottom_bar_bg_color: '#000000'
  };

  const url: string = `${webUrl}${webUrl.endsWith('/') ? '' : '/'}#tgWebAppData=${encodeURIComponent(init_data)}&tgWebAppVersion=9.1&tgWebAppPlatform=web&tgWebAppThemeParams=${encodeURIComponent(
    JSON.stringify(themeParams)
  )}`;

  return url;
}

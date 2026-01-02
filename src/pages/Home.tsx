import makeInitData from '@/utils/makeInitData.ts'
import {useState, useEffect, useRef} from 'react'
import {ArrowLeft, EllipsisVertical, X} from 'lucide-react'
import UrlPopup from '@/components/urlPopup'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CircularProgress from '@mui/material/CircularProgress'
import {usePopup} from "@/hooks/usePopup"
import getDeviceId from '@/utils/fp.ts'
import storage from '@/utils/storage.ts';
import {encode, decode} from 'mh-encoder';
import {useNavigate, useLocation} from 'react-router';

interface BackBtn {
    is_visible?: boolean;
}

interface MainBtn {
    is_visible?: boolean;
    is_active?: boolean;
    is_progress_visible?: boolean;
    text?: string;
    color?: string;
    text_color?: string;
    has_shine_effect?: boolean;
    event?: string;
}

interface SecBtn {
    is_visible?: boolean;
    is_active?: boolean;
    is_progress_visible?: boolean;
    text?: string;
    color?: string;
    text_color?: string;
    has_shine_effect?: boolean;
    position?: 'top' | 'left' | 'bottom' | 'right';
    event?: string;
}

interface StgBtn {
    is_visible?: boolean;
}

interface IThemeParams {
    bg_color?: string
    button_color?: string
    button_text_color?: string
    hint_color?: string
    link_color?: string
    secondary_bg_color?: string
    text_color?: string
    header_bg_color?: string
    accent_text_color?: string
    section_bg_color?: string
    section_header_text_color?: string
    subtitle_text_color?: string
    destructive_text_color?: string
    header_color?: string
  };

const themeParams: IThemeParams = {
    bg_color: "#181819",
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
    header_color: '#181818'
  };
  
function enterFullscreen(element = document.documentElement) {
    if ((element as any).requestFullscreen) {
        (element as any).requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) { 
        (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) { 
        (element as any).msRequestFullscreen(); 
    }
}

function exitFullscreen() {
    if ((document as any).exitFullscreen) {
        (document as any).exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) { 
        (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) { 
        (document as any).msExitFullscreen();
    }
}
interface WebData {
    need_confirmation?: boolean;
}

interface IResult {
    access_granted: boolean
    access_requested: boolean
    device_id?: string | null
    available: boolean
    token_saved?: boolean
    type?: string
}

async function initBiometrics() {
    let result: IResult = {
        access_granted: false,
        access_requested: false,
        device_id: null,
        available: false,
        token_saved: false,
        type: 'unknown'
    };

    if (!window.PublicKeyCredential) return result;

    result.access_requested = storage.get('bm_allowed');
    try {
        const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        result.available = isAvailable;
        if (isAvailable) {
            result.access_granted = storage.get('bm_allowed');
            result.device_id = await getDeviceId();
            result.type = 'fingerprint';
            result.token_saved = storage.get('bm_token') ? true : false;
            if (navigator.userAgent.toLowerCase().includes('face')) result.type = 'face';
        }
    } catch (e) {}

    return result;
}

async function authenticate(rs: string = '') {
    try {
        const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: { name: rs },
    user: {
        id: userId,
        name: "user@example.com",
        displayName: "Example User"
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" as const }],
    authenticatorSelection: {
        authenticatorAttachment: "platform" as AuthenticatorAttachment
    },
    timeout: 60000
  };

   return await navigator.credentials.create({ publicKey });
    } catch(err: any) {
        console.log(err);
        return false;
    }
}

interface AccelerometerOptions {
  frequency?: number;
}
declare class Accelerometer {
  constructor(options?: AccelerometerOptions);
  x: number;
  y: number;
  z: number;
  start(): void;
  stop(): void;
  addEventListener(event: 'reading', listener: () => void): void;
}

export default function Home() {
    const [webUrl, setWebUrl] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const [url, setUrl] = useState<string>('');
    const [failed, setFailed] = useState<boolean>(false);
    const webapp = useRef<HTMLIFrameElement>(null)
    const [backBtn, setBackBtn] = useState<BackBtn>({})
    const [mainBtn, setMainBtn] = useState<MainBtn>({})
    const [stgBtn, setStgBtn] = useState<StgBtn>({})
    const [secBtn, setSecBtn] = useState<SecBtn>({})
    const [closed, setClosed] = useState<boolean>(false)
    const [theme, setTheme] = useState<IThemeParams>({});
    const {popup} = usePopup();
    const container = useRef(null);
    const [webData, setWebData] = useState<WebData>({});
    const sensorRef = useRef<Accelerometer | null>(null);
    const navigate = useNavigate();
    const location = useLocation()
    
    const reload = () => {
        window.location.reload();
    }
    
    const postEvent = (eventType: string, eventData: any = '') => {
          if (!webapp.current) return;
          webapp.current?.contentWindow?.postMessage(JSON.stringify({
              eventType, eventData
          }), '*');
   }
  
   const setAm = (rr: boolean | number = 1000) => {
       try {
       if (rr === false) {
           sensorRef.current?.stop();
           sensorRef.current = null;
           return true;
       }
       if ('Accelerometer' in window) {
           if (typeof rr !== 'string') return
           const sensor = new Accelerometer({frequency: 1000 / rr});
           sensor.addEventListener('reading', () => {
               postEvent('accelerometer_changed', {
                   x: sensor.x,
                   y: sensor.y,
                   z: sensor.z
               })
           });
           sensor.start();
           sensorRef.current = sensor;
           return true;
       } else {
           postEvent('accelerometer_failed', {error: 'UNSUPPORTED'});
       }
       } catch(err: any) {
           postEvent('accelerometer_failed', {error: 'UNSUPPORTED'});
       }
   }
    
    useEffect(() => {
        window.addEventListener('message', async(event) => {
              const data = JSON.parse(event.data);
              const {eventType, eventData} = data;
              console.log("New Event:", eventType, eventData);
              
             if (eventType === 'web_app_setup_back_button') {
                 setBackBtn(eventData)
             }
             
             if (eventType === "web_app_setup_main_button") {
                 setMainBtn({...eventData, event: 'main_button_pressed'});
             }
             
             if (eventType === 'web_app_setup_secondary_button') {
                 setSecBtn({...eventData, event: 'secondary_button_pressed'})
             }
             
             if (eventType === 'web_app_set_header_color') {
                 type ThemeKeys = keyof typeof themeParams;
                 const colorKey = eventData.color_key as ThemeKeys;
                 const color = eventData.color || themeParams[colorKey] || '#181819'
                 setTheme(p => ({...p, header_color: color}))
             }
             
             if (eventType === 'web_app_set_background_color') {
                 type ThemeKeys = keyof typeof themeParams;
                 const colorKey = eventData.color_key as ThemeKeys;
                 const color = eventData.color || themeParams[colorKey] || '#181819'
                 setTheme(p => ({...p, bg_color: color}));
             }
             
             if (eventType === 'web_app_set_bottom_bar_color') {
                 type ThemeKeys = keyof typeof themeParams;
                 const colorKey = eventData.color_key as ThemeKeys;
                 const color = eventData.color || themeParams[colorKey] || '#181819'
                 setTheme(p => ({...p, bottom_bar_color: color}));
                 document.documentElement.style.background = color;
             }
             
             if (eventType === 'web_app_open_popup') {
                 const _btns = (eventData.buttons as Array<{ id: string; onClick?: () => void }>).map((b) => {
                     b.onClick = () => {
                         postEvent('popup_closed', {button_id: b.id})
                     }
                     return b;
                 })
                 popup({...eventData, buttons: _btns.reverse(), onClose: () => postEvent('popup_closed')});
             }
             
             if (eventType === 'web_app_request_fullscreen') {
                 try {
                     enterFullscreen();
                 } catch(err: any) {
                     popup({message: 'This mini app needs to open in full screen', title: 'Fullscreen request', buttons: [
                         {text: 'Ok', onClick: () => enterFullscreen()},
                     ],
                     onClose: () => enterFullscreen()
                     })
                 }
             }
             
             if (eventType === 'web_app_exit_fullscreen') {
                 exitFullscreen()
             }
             
             if (eventType === 'web_app_expand') {
                 setClosed(false)
             }
             
             if (eventType === 'web_app_close') {
                 setClosed(true)
             }
             
             if (eventType === 'web_app_setup_closing_behavior') {
                 setWebData(p => ({...p, need_confirmation: eventData.need_confirmation}))
             }
             
             if (eventType === 'web_app_open_link') {
                 window.open(eventData.url, '_blank')
             }
             
             if (eventType === 'web_app_open_tg_link') {
                 window.location.href = `https://t.me${eventData.path_full}`
             }
             
             if (eventType === 'web_app_open_invoice') {
                 window.location.href = `https://t.me/$${eventData.slug}`
             }
             
             if (eventType === 'web_app_biometry_get_info') {
                 const bd = await initBiometrics();
                 postEvent('biometry_info_received', bd)
             }
             
             if (eventType === 'web_app_biometry_request_access') {
                 if (storage.get('bm_allowed')) {
                     const bd = await initBiometrics();
                     return postEvent('biometry_info_received', bd)
                 }
                 
                 async function rqa() {
                     if (await authenticate()) {
                     storage.set('bm_allowed', true);
                     const bd = await initBiometrics();
                     bd.access_granted = true;
                     postEvent('biometry_info_received', bd)
                     }
                 }
                 
                 popup({message: `Do you want to allow device biometrics?\n${eventData.reason || ''}`, title: 'Biometric Request', buttons: [
                     {text: 'Cancel'},
                     {text: 'Allow', onClick: rqa},
                 ]});
             } 
             
             if (eventType === 'web_app_biometry_request_auth') {
                 const isAuth = await authenticate(eventData.reason)
                 if (isAuth) {
                     const btk = storage.get('bm_token');
                     postEvent('biometry_auth_requested', {
                         status: 'authorized',
                         token: btk ? decode(btk) : undefined
                     });
                 } else {
                     postEvent('biometry_auth_requested', {
                         status: 'failed'
                     })                     
                 }
             } 
             
             if (eventType === 'web_app_biometry_update_token') {
                 storage.set('bm_token', encode(eventData.token));
                 postEvent('biometry_token_updated', {status: 'updated'});
             }
             
             if (eventType === 'web_app_setup_settings_button') {
                 setStgBtn(eventData);
             }
             
             if (eventType === 'web_app_invoke_custom_method') {
                 if (eventData.method === 'saveStorageValue') {
                 try {
                     const cs = storage.get('cloud_storage') || {};
                     cs[eventData.params.key] = eventData.params.value;
                     storage.set('cloud_storage', cs);
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result: true});
                 } catch(err: any) {
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result: false, error: 'Couldn’t save to cloud storage'})
                 }
                 } else if (eventData.method === 'getStorageValues') {
                 try {
                     const cs = storage.get('cloud_storage') || {};
                     const result: any = {};
                     (eventData.params.keys as string[]).forEach((v: string) => {
                         result[v] = cs[v] ?? undefined;
                     });
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result});
                 } catch(err: any) {
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result: false, error: err.message})
                 }
                 } else if (eventData.method === 'deleteStorageValues') {
                 try {
                     const cs = storage.get('cloud_storage') || {};
                     (eventData.params.keys as string[]).forEach((v: string) => {
                         delete cs[v];
                     });
                     storage.set('cloud_storage', cs);
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result: true});
                 } catch(err: any) {
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result: false, error: err.message})
                 }
                 } else if (eventData.method === 'getStorageKeys') {
                 try {
                     const cs = storage.get('cloud_storage') || {};
                     const result = Object.keys(cs);
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result});
                 } catch(err: any) {
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result: false, error: err.message})
                 }
                 }
                 
             }
             if (eventType === 'web_app_start_accelerometer') {
                 postEvent('accelerometer_started');
                 setAm(eventData.refresh_rate);
             }
             if (eventType === 'web_app_stop_accelerometer') {
                 setAm(false);
             }
             if (eventType === 'web_app_start_device_orientation') {
                 postEvent('device_orientation_failed', {error: 'UNSUPPORTED'});
             }
             if (eventType === 'web_app_start_gyroscope') {
                 postEvent('gyroscope_failed', {error: 'UNSUPPORTED'});
             }
             if (eventType === 'web_app_check_location') {
                 const available = 'geolocation' in navigator;
                 const granted = storage.get('lc_allowed') || false;
                 postEvent('location_checked', {available, access_requested: granted, access_granted: granted});
             }
             if (eventType === 'web_app_request_location') {
                 try {
                     const getLocation = () => {
                     navigator.geolocation.getCurrentPosition(pos => {
                     postEvent('location_requested', pos.coords)
                     },
                     err => {
                         console.log(err.message)
                     }
                     )
                 }
                 if (!storage.get('lc_allowed')) {
                     popup({
                         message: "Do you want to allow your geolocation?",
                         title: "Location request",
                         buttons: [
                             {
                                 text: 'Cancel'
                             },
                             {text: 'Allow', onClick: () => {
                                 storage.set('lc_allowed', true);
                                 getLocation();
                             }},
                         ]
                     })
                 } else {
                     getLocation()
                 }
                 } catch(err: any) {
                    console.log(err) 
                 }                                
             }
             if (eventType === 'web_app_device_storage_save_key') {
                 try {
                     const ds = storage.get('device_storage') || {};
                     ds[eventData.key] = eventData.value;
                     storage.set('device_storage', ds);
                     postEvent('device_storage_key_saved', {req_id: eventData.req_id});
                 } catch(err: any) {
                     postEvent('device_storage_failed', {req_id: eventData.req_id, error: err.message});
                 }
             }
             if (eventType === 'web_app_device_storage_get_key') {
                 try {
                     const ds = storage.get('device_storage') || {};
                     const value = ds[eventData.key];
                     postEvent('device_storage_key_received', {req_id: eventData.req_id, value});
                 } catch(err: any) {
                     postEvent('device_storage_failed', {req_id: eventData.req_id, error: err.message});
                 }
             }
             if (eventType === 'web_app_device_storage_clear') {
                 try {
                     storage.set('device_storage', {});
                     postEvent('device_storage_cleared', {req_id: eventData.req_id});
                 } catch(err: any) {
                     postEvent('device_storage_failed', {req_id: eventData.req_id, error: err.message});
                 }
             }
             
             if (eventType === 'web_app_secure_storage_save_key') {
                 try {
                     const ss = storage.get('secure_storage') || {};
                     ss[eventData.key] = eventData.value;
                     storage.set('secure_storage', ss);
                     postEvent('secure_storage_key_saved', {req_id: eventData.req_id});
                 } catch(err: any) {
                     postEvent('secure_storage_failed', {req_id: eventData.req_id, error: err.message});
                 }
             }
             if (eventType === 'web_app_secure_storage_get_key') {
                 try {
                     const ss = storage.get('secure_storage') || {};
                     const value = ss[eventData.key];
                     postEvent('secure_storage_key_received', {req_id: eventData.req_id, value});
                 } catch(err: any) {
                     postEvent('secure_storage_failed', {req_id: eventData.req_id, error: err.message});
                 }
             }
             if (eventType === 'web_app_secure_storage_clear') {
                 try {
                     storage.set('secure_storage', {});
                     postEvent('secure_storage_cleared', {req_id: eventData.req_id});
                 } catch(err: any) {
                     postEvent('secure_storage_failed', {req_id: eventData.req_id, error: err.message});
                 }
             }
             if (eventType === 'web_app_secure_storage_restore_key') {
                     postEvent('secure_storage_failed', {req_id: eventData.req_id, error: 'RESTORE_UNAVAILABLE'});
             }
        })
    }, [])
    
    useEffect(() => {
    const storedUrl = storage.get('url');
    if (!url && !storedUrl) return setOpen(true);

    const u = url || storedUrl;
    
    const tk = storage.get('token') || '7706964024:AAGvYJF6A6IuS81H7-JMgHql4vaioituaHc';
        
    const data = makeInitData(tk, u + location.pathname + location.search);

    setWebUrl(prev => (prev !== data ? data : prev));
    }, [url])
    
    const btns = () => {
        const b = [mainBtn, secBtn];
        if (['left', 'top'].includes(secBtn.position || '')) return b.reverse();
        else return b;
    }
    
    return(<div className="w-screen h-[100dvh] text-white flex flex-col" style={{
        background: theme.bg_color || themeParams.bg_color
    }} ref={container}>
        
        <UrlPopup open={open} setOpen={setOpen} onSubmit={(vl: string) => {
            setUrl(vl);
            storage.setUrl(vl);
            storage.add(vl);
            setOpen(false);
        }}/>
        
        {!closed && <header className="w-full p-2 flex justify-between border-b-1 border-[#333]" style={{
            background: theme.header_color || themeParams.bg_color
        }}>
            <div className="flex gap-2 items-center">
            <button onClick={() => {
                if (!backBtn.is_visible) {
                    if (!webData.need_confirmation) setClosed(true);
                    else popup({message: 'Do you want to close miniapp?', title: 'Close App', buttons: [
                        {text: 'Cancel'},
                        {text: 'Close', type: 'destructive', onClick: () => setClosed(true)}
                    ]})
                };
                postEvent('back_button_pressed')
            }} className="ripple px-1.5 rounded-full">{backBtn.is_visible ? <ArrowLeft /> : <X />}</button>
            <div className='w-full flex'>
            <span className="font-bold">MiniApp</span>
            </div>
            </div>
            {<DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open menu" size="icon-sm" className="rounded-full ripple">            
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40 bg-[#222] border-[#444] text-white" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setOpen(true)} className="ripple focus:transparent">
              <span>Change URL</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={() => reload()} className="ripple focus:transparent">
              <span>Reload</span>
            </DropdownMenuItem>
            
            {stgBtn.is_visible && <DropdownMenuItem className="ripple focus:transparent" onSelect={() => postEvent('settings_button_pressed')}>
              <span>Settings</span>
            </DropdownMenuItem>}
            
            <DropdownMenuItem onSelect={() => navigate('/edit')} className="ripple focus:transparent">
             <span>Edit</span>
            </DropdownMenuItem>
            
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>}
        </header>}
        
        
        {webUrl && <iframe src={webUrl} className="w-full flex-1 border-none" onError={() => setFailed(true)} ref={webapp}>
            
        </iframe>}
        {!webUrl && !failed && <div className="flex w-full h-[90%] justify-center items-center flex-col gap-2 overflow-hidden">
            <h3 className="text-2xl">Loading</h3>
            <p className="text-[#999]"></p>
        </div>}
        
        {closed && <div className="flex w-screen h-screen fixed top-0 left-0 z-4 justify-center items-center flex-col gap-2 overflow-hidden bg-[#333]">
            <h3 className="text-2xl">Closed</h3>
            <p className="text-[#999]">Miniapp closed</p>
            <button className="py-2 px-10 bg-blue-500 rounded-xl ripple" onClick={() => setClosed(false)}>Open</button>
        </div>}
        
        {!webUrl && <div className="flex w-screen h-screen fixed top-0 left-0 z-4 justify-center items-center flex-col gap-2 overflow-hidden bg-[#333]">
            <h3 className="text-2xl">No Website Added Yet</h3>
            <p className="text-[#999]">Add a website URL to get started</p>
            <button className="py-2 px-10 bg-blue-500 rounded-xl ripple" onClick={() => setOpen(true)}>Add URL</button>
        </div>}
        
        {(mainBtn.is_visible || secBtn.is_visible) && <div className={`w-full bg-black py-2 px-3 flex justify-center gap-2 ${['top', 'bottom'].includes(secBtn.position || '') ? 'flex-col' : ''}`}>
            
            {!closed && btns().map((btn, ind) => {
                if (!btn?.is_visible) return;
                
                return(<button className={`w-full py-2.5 bg-blue-500 rounded-lg active:scale-96 data-[inactive=true]:active:scale-100 transition-transform duration-200 flex items-center justify-center ripple ${btn.has_shine_effect ? 'shine-effect' : ''}`} data-inactive={!btn.is_active} data-rp-color={btn.text_color + '50'} style={{background: btn.color || '#007bff', color: btn.text_color || 'white'}} onClick={() => {
                if (!btn.is_active) return;
                postEvent(btn.event || "")
            }} key={ind}>
                {btn.is_progress_visible ? <CircularProgress size={'1.5em'} color="inherit"/> : <span>{btn.text || "Continue"}</span>}
            </button>)
            })}
            
        </div>}
    </div>)
}

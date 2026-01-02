const storage: any = {};

const parse = (v: string) => {
    try {
        return JSON.parse(v);
    } catch {
        return [];
    }
};
const str = (v: any) => JSON.stringify(v);

const getKey = (key: string, json = false) => {
    const raw = localStorage.getItem(key);
    if (json) return raw ? parse(raw) : [];
    return raw;
};

interface WebData {
    url: string;
    token?: string;
    [key: string]: any;
}

storage.set = (key: string, value: any = '') => {
    const arr: WebData[] = getKey('_tg_webs', true);
    const webUrl = getKey('_tg_current');
    if (!webUrl) return null;

    const ind = arr.findIndex(w => w.url === webUrl);
    if (ind === -1) return null;

    arr[ind][key] = value;
    localStorage.setItem('_tg_webs', str(arr));
};

storage.get = (key: string) => {
    const arr: WebData[] = getKey('_tg_webs', true);
    const webUrl = getKey('_tg_current');
    if (!webUrl) return null;

    const ind = arr.findIndex(w => w.url === webUrl);
    if (ind === -1) return null;

    return arr[ind][key];
};

storage.add = (url: string) => {
    const arr: WebData[] = getKey('_tg_webs', true);
    const exist = arr.find(a => a.url === url);
    if (!exist) {
        arr.push({ url });
        localStorage.setItem('_tg_webs', str(arr));
    }
    if (!localStorage.getItem('_tg_current')) {
        localStorage.setItem('_tg_current', url);
    }
};

storage.setUrl = (url: string) => {
    localStorage.setItem('_tg_current', url);
};

storage.getUrl = () => localStorage.getItem('_tg_current');

export default storage;
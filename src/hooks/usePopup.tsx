import { createContext, useContext, useState, useRef, useEffect } from "react";
import type {ReactNode, ElementType} from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface InputOnChange {
    value: string;
    setIcon: (Ico: ElementType) => void;
    setErrorMsg: (data: string) => void;
    [key: string]: any;
}

interface PopupInput {
placeholder?: string;
value?: string;
Icon?: ElementType,
onChange?: (data: InputOnChange) => void;
type: "text" | "number";
onlyNumbers: boolean;
[key: string]: any;
}

interface PopupCheckbox { label: string; defaultChecked?: boolean; }

interface PopupButton {
  text: string;
  type?: "cancel" | "default" | "ok" | "close" | "destructive";
  color?: string;
  close?: boolean;
  radioChecked?: boolean;
  onClick?: (data: { inputs: { value: string; setIcon: (Ico: ElementType) => void }[]; checkboxes: boolean[]; input: { value: string; setIcon: (Ico: ElementType) => void }, close: () => void, radioChecked: string, setErrorMsg: (str: string) => void}) => void;
  [key: string]: any;
}

interface RadioValues {
    text: string
    value: string
}

interface PopupRadio {
    title: string
    value?: string
    values: RadioValues[]
}

interface PopupOptions { title?: string; message?: string; inputs?: PopupInput[]; checkboxes?: PopupCheckbox[]; buttons?: PopupButton[]; radio?: PopupRadio, onClose?: () => void }

type PopupContextType = { popup: (options: PopupOptions) => void; };

const PopupContext = createContext<PopupContextType>({ popup: () => {} });

export function usePopup() { return useContext(PopupContext); }

export function PopupProvider({ children }: { children: ReactNode }) {
const [options, setOptions] = useState<PopupOptions | null>(null);
const [inputs, setInputs] = useState<string[]>([]);
const [checkboxes, setCheckboxes] = useState<boolean[]>([]);
const [radioChecked, setRadioChecked] = useState<string>('')
const [errorMsg, setErrorMsg] = useState<string>('');
const [isClose, setIsClose] = useState<boolean>(false);
const inputsRef = useRef<Array<HTMLInputElement | null>>([])
const hasFocused = useRef(false);

const popup = (opts: PopupOptions) => {setOptions(opts); setInputs((opts.inputs || []).map(i => i.value || "")); setCheckboxes((opts.checkboxes || []).map(c => c.defaultChecked || false)); setErrorMsg(''); setIsClose(false)};

const close = () => {
    setIsClose(true);
    setTimeout(() => {
        setOptions(null);
        setIsClose(false);
        hasFocused.current = false;
        options?.onClose?.()
    }, 300)
};

const setIcon = (Ico: ElementType, idx: number) => {
      setOptions(prev => {
        if (!prev || !prev.inputs) return prev;
        const newInputs = [...prev.inputs];
        newInputs[idx].Icon = Ico;
        return { ...prev, inputs: newInputs };
      });
};

useEffect(() => {
    if (!options?.inputs || hasFocused.current) return;
    setTimeout(() => {
        if (inputsRef.current[0] && options?.inputs && options?.inputs?.length > 0) {
         if (options?.inputs[0]?.focus) inputsRef.current[0]?.focus();
         if (options?.inputs[0]?.select) inputsRef.current[0]?.select();
        }
        hasFocused.current = true;
    }, 50)
}, [options])

return ( <PopupContext.Provider value={{ popup }}> {children} {options && ( <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" style={{
        animation: `${isClose ? 'popup-overlay-close' : 'popup-overlay-open'} 0.3s linear forwards`
    }} onClick={() => close()}>
    <div className="bg-neutral-900 rounded-2xl p-5 bt-3 w-[70%] space-y-4" style={{
        animation: `${isClose ? 'popup-close' : 'popup-open'} 0.3s linear forwards`
    }} onClick={(e) => e.stopPropagation()}>
        
        <div className="flex flex-col gap-0.25">
        <h2 className="text-xl font-semibold text-[#007bff]">{options.title || 'Popup'}</h2>
        {options.message && <p className="text-neutral-300 text-sm mt-2">{options.message}</p>}
        </div>

{options?.inputs && (
          <div className="space-y-3">
            {options?.inputs.map((inp, i) => {
            
            return(
            
             <div className="relative" key={i}>
              <input
                className="w-full bg-neutral-800 text-white py-2 outline-none border-[#333] focus:border-[#007bff] bg-transparent border-b transition-border duration-200 pr-7"
                placeholder={inp.placeholder}
                type={inp.type}
                value={inputs[i] || inputs[i] === '' ? inputs[i] : inp.value || ''}
                ref={(el) => {inputsRef.current[i] = el}}
                onChange={e => {
                  const vv = inp.type === 'number' && inp.onlyNumbers ? e.target.value.replace(/[^0-9]/g, '') : e.target.value
                  const v = [...inputs];
                  v[i] = vv;
                  setInputs(v);
                  if (inp.onChange) inp.onChange({value: vv, setIcon: (Ico: ElementType) => setIcon(Ico, i), setErrorMsg});
                }}
              />
              {inp.Icon && <span className="absolute top-1/2 right-0 -translate-y-1/2"> <inp.Icon /> </span>}
              </div>
            )})}
            <div className="text-[#ff2a35] mt-4 text-sm">{errorMsg}</div>
          </div>
        )}

        {options.checkboxes && (
          <div className="space-y-2">
            {options.checkboxes.map((c, i) => (
              <label key={i} className="flex items-center gap-2 text-neutral-300 text-base select-none">
                <Checkbox
                  className="w-5 h-5 border-1 border-[#333] bg-transparent data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500 transition-colors duration-300"
                  defaultChecked={checkboxes[i]}
                  onCheckedChange={checked => {
                    const v = [...checkboxes];
                    v[i] = checked === true;
                    setCheckboxes(v);
                  }}
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
        )}
        {options.radio && <div className="text-white">
            <h3 className="text-[#ccc]">Duration type</h3>
            <RadioGroup defaultValue={options.radio.value} className="gap-2 py-2" onValueChange={setRadioChecked}>
            {options.radio.values.map((radio, idx) => (
              <div className="flex items-center space-x-2" key={idx}>
               <RadioGroupItem value={radio.value} id={`radio-${radio.value}`} className="data-[state=checked]:border-blue-500 text-blue-500"/>
              <Label htmlFor={`radio-${radio.value}`}>{radio.text}</Label>
             </div>
            ))}
            </RadioGroup>
        </div>}
        <div className="flex justify-end gap-1 pt-1 w-full">
          {options.buttons?.map((b, i) => {
            const cl: string = b.type === 'destructive' ? '#ff2a35' : '#007bff';
            const color: string = b.color || cl;
            return(
            <button
              key={i}
              className="px-4 py-2 rounded-md bg-transparent text-white text-sm ripple min-w-12 max-w-30 truncate"
              style={{color}}
              data-rcl={color + '40'}
              onClick={() => {
                const inps = inputs.map((inp, idx) => {
                    return {value: inp, setIcon: (Ico: ElementType) => setIcon(Ico, idx)}
                })
                b.onClick?.({ inputs: inps, checkboxes, input: inps[0], setErrorMsg, close, radioChecked: radioChecked || options.radio?.value || ''});
                if (b.close !== false) close();
              }}
            >
              <span>{b.type === 'ok' ? 'Ok' : b.type === 'close' ? 'Close' : b.type === 'cancel' ? 'Cancel' : b.text}</span>
            </button>
          )})}
        </div>
      </div>
    </div>
  )}
</PopupContext.Provider>

); }

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {useState} from 'react'

interface UrlPopupProps {
  setOpen: (open: boolean) => void;
  open: boolean;
  onSubmit: (url: string) => void;
}

function isUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}

export default function UrlPopup({setOpen, open = true, onSubmit}: UrlPopupProps) {
  const [url, setUrl] = useState<string>('');
  const onOpen = (state: boolean) => {
      setOpen(state)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpen} modal={true}>
      <form>        
        <DialogContent className="sm:max-w-[425px] bg-[#181819] text-white border-[#444]">
          <DialogHeader>
            <DialogTitle>Set Website URL</DialogTitle>
            <DialogDescription>
              Enter a website URL to continue setting up the mini app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="url">URL</Label>
              <Input id="url" placeholder="http://localhost:5173" required={true} type="url" onChange={(e) => setUrl(e.target.value)} className="border-[#444]"/>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!isUrl(url)} onClick={() => onSubmit(url)} className="bg-white text-black">Save</Button> 
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

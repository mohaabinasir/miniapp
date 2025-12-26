import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {useState} from 'react'

interface UrlPopupProps {
  setOpen: (open: boolean) => void;
  open: boolean;
  onSubmit: () => void;
}

function isUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export default function UrlPopup({setOpen, open, onSubmit}: UrlPopupProps) {
  const [url, setUrl] = useState<string>('');
  const onOpen = (state) => {
      if (!state) return;
      setOpen(state)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpen} model={true}>
      <form>        
        <DialogContent className="sm:max-w-[425px] bg-[#181819] text-white border-[#444]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Set Web URL</DialogTitle>
            <DialogDescription>
              Enter the web URL to continue setting up the mini app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="url">URL</Label>
              <Input id="url" placeholder="http://localhost:5000" required={true} type="url" onChange={(e) => setUrl(e.target.value)} className="border-[#444]"/>
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

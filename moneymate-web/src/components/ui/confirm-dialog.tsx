 "use client";
 
 import { Button } from "@/components/ui/button";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 
 type ConfirmDialogProps = {
   open: boolean;
   title: string;
   description?: string;
   confirmText?: string;
   cancelText?: string;
   onConfirm: () => void;
   onCancel: () => void;
   loading?: boolean;
   confirmVariant?: "default" | "destructive";
 };
 
 export default function ConfirmDialog({
   open,
   title,
   description,
   confirmText = "Confirm",
   cancelText = "Cancel",
   onConfirm,
   onCancel,
   loading = false,
   confirmVariant = "destructive",
 }: ConfirmDialogProps) {
   return (
     <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
       <DialogContent className="max-w-md">
         <DialogHeader>
           <DialogTitle>{title}</DialogTitle>
           {description && (
             <DialogDescription>{description}</DialogDescription>
           )}
         </DialogHeader>
         <DialogFooter className="mt-2">
           <Button
             type="button"
             variant="outline"
             onClick={onCancel}
             disabled={loading}
           >
             {cancelText}
           </Button>
           <Button
             type="button"
             variant={confirmVariant}
             onClick={onConfirm}
             disabled={loading}
           >
             {loading ? "Processing..." : confirmText}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }

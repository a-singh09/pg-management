"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  requireNameConfirmation?: boolean;
}

type DialogStep = "first" | "name-confirmation" | "closed";

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  requireNameConfirmation = false,
}: DeleteConfirmationDialogProps) {
  const [step, setStep] = useState<DialogStep>("closed");
  const [enteredName, setEnteredName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("first");
      setEnteredName("");
      setIsDeleting(false);
    } else {
      setStep("closed");
    }
  }, [isOpen]);

  const handleFirstConfirm = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (requireNameConfirmation && itemName) {
      setStep("name-confirmation");
    } else {
      handleFinalConfirm();
    }
  };

  const handleFinalConfirm = async () => {
    if (
      requireNameConfirmation &&
      itemName &&
      enteredName.trim() !== itemName
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setStep("closed");
    setEnteredName("");
    setIsDeleting(false);
    onClose();
  };

  return (
    <>
      {/* First confirmation dialog */}
      <Dialog
        open={step === "first"}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleFirstConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Name confirmation dialog */}
      <Dialog
        open={step === "name-confirmation"}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Please enter the name to confirm</DialogTitle>
            <DialogDescription>
              To confirm deletion, please type "{itemName}" below:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="confirmName">Name</Label>
            <Input
              id="confirmName"
              value={enteredName}
              onChange={(e) => setEnteredName(e.target.value)}
              placeholder={`Type "${itemName}" to confirm`}
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFinalConfirm}
              disabled={enteredName.trim() !== itemName || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

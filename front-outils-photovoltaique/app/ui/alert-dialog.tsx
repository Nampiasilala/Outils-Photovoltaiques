"use client";

import {
  Root as AlertDialog,
  Trigger as AlertDialogTrigger,
  Portal as AlertDialogPortal,
  Overlay as AlertDialogOverlayBase,
  Content as AlertDialogContentBase,
  Title as AlertDialogTitleBase,
  Description as AlertDialogDescriptionBase,
  Action as AlertDialogActionBase,
  Cancel as AlertDialogCancelBase,
} from "@radix-ui/react-alert-dialog";
import {
  forwardRef,
  type ElementRef,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/ui/button";

const AlertDialogOverlay = forwardRef<
  ElementRef<typeof AlertDialogOverlayBase>,
  ComponentPropsWithoutRef<typeof AlertDialogOverlayBase>
>(({ className, ...props }, ref) => (
  <AlertDialogOverlayBase
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = forwardRef<
  ElementRef<typeof AlertDialogContentBase>,
  ComponentPropsWithoutRef<typeof AlertDialogContentBase>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogContentBase
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = forwardRef<
  ElementRef<typeof AlertDialogTitleBase>,
  ComponentPropsWithoutRef<typeof AlertDialogTitleBase>
>(({ className, ...props }, ref) => (
  <AlertDialogTitleBase ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = forwardRef<
  ElementRef<typeof AlertDialogDescriptionBase>,
  ComponentPropsWithoutRef<typeof AlertDialogDescriptionBase>
>(({ className, ...props }, ref) => (
  <AlertDialogDescriptionBase ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = forwardRef<
  ElementRef<typeof AlertDialogActionBase>,
  ComponentPropsWithoutRef<typeof AlertDialogActionBase>
>(({ className, ...props }, ref) => (
  <AlertDialogActionBase ref={ref} className={cn(buttonVariants(), className)} {...props} />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = forwardRef<
  ElementRef<typeof AlertDialogCancelBase>,
  ComponentPropsWithoutRef<typeof AlertDialogCancelBase>
>(({ className, ...props }, ref) => (
  <AlertDialogCancelBase
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

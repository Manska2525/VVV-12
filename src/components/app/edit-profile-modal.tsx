"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BadgeCheck, MapPin, Upload, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTelegram } from "./telegram-provider";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { user } = useTelegram();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(
    user ? [user.first_name, user.last_name].filter(Boolean).join(" ") : "Алекс"
  );
  const [bio, setBio] = useState(
    "Люблю путешествия, спорт и интересные разговоры"
  );
  const [age, setAge] = useState("28");
  const [city, setCity] = useState("Москва");
  const initialPhotos = (user as any)?.photos?.map((p: any) => p.url) ?? (user?.photo_url ? [user.photo_url] : []);
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [photoIndex, setPhotoIndex] = useState(0);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxLeft = 3 - photos.length;
    const files = Array.from(e.target.files || []).slice(0, maxLeft || 0);
    if (files.length === 0) {
      // clear input so same file can be re-selected later
      e.currentTarget.value = "";
      return;
    }
    const readers = files.map((file) => {
      return new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = (event) => res(event.target?.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((results) => {
      setPhotos((prev) => {
        const next = [...prev, ...results].slice(0, 3);
        return next;
      });
      setPhotoIndex(0);
      e.currentTarget.value = "";
      console.log("Фото загружены:", files.map((f) => f.name));
    });
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next;
    });
    setPhotoIndex((prev) => Math.max(0, prev - 1));
  };

  const prevPhoto = () => setPhotoIndex((p) => {
    if (photos.length === 0) return 0;
    return (p - 1 + photos.length) % photos.length;
  });
  const nextPhoto = () => setPhotoIndex((p) => {
    if (photos.length === 0) return 0;
    return (p + 1) % photos.length;
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    touchEndRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartRef.current == null || touchEndRef.current == null) return;
    const delta = touchEndRef.current - touchStartRef.current;
    const threshold = 50;
    if (delta > threshold) {
      // swipe right -> prev
      prevPhoto();
    } else if (delta < -threshold) {
      // swipe left -> next
      nextPhoto();
    }
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  const handleSave = () => {
    console.log({ name, bio, age, city, photos });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-h-[90vh] max-w-md overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Редактировать анкету</DialogTitle>
        </DialogHeader>

        {/* Анкета как будет выглядеть в поиске */}
        <div className="mb-4">
          <p className="mb-3 text-xs font-semibold text-muted-foreground">Предпросмотр Анкеты</p>
          <div className="relative h-96 overflow-hidden rounded-3xl bg-card shadow-xl ring-1 ring-black/5">
            {/* Photo */}
              {photos.length > 0 ? (
                // render layered images to animate transitions
                <div
                  className="absolute inset-0 h-full w-full overflow-hidden"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {photos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={p}
                      alt={`${name} ${i + 1}`}
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover transition-all duration-300 ease-out",
                        i === photoIndex
                          ? "opacity-100 translate-x-0 z-0"
                          : "opacity-0 translate-x-4 z-0"
                      )}
                    />
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/5 to-black/10">
                  <div className="rounded-2xl h-56 w-80 flex items-center justify-center">
                    <ImageIcon className="h-14 w-14 text-white/40" />
                  </div>
                </div>
              )}

              {/* Counter e.g. 2/3 */}
              {photos.length > 0 && (
                <div className="absolute right-3 top-3 z-30 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                  {photoIndex + 1}/{photos.length}
                </div>
              )}

            {/* Photo indicators */}
            <div className="absolute inset-x-0 top-0 z-10 flex gap-2 p-3 justify-center">
              {photos.length > 0 ? (
                photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={cn(
                      "h-1.5 w-8 rounded-full transition-all",
                      i === photoIndex ? "bg-white" : "bg-white/40"
                    )}
                    aria-label={`Photo ${i + 1}`}
                  />
                ))
              ) : (
                <div className="h-1.5 w-24 mx-auto rounded-full bg-white" />
              )}
            </div>

            {/* Prev / Next buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-3 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 z-10 h-2/3 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />

            {/* Profile info */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-5 text-white">
              <div className="mb-2 flex items-end gap-2">
                <h2 className="text-3xl font-bold leading-none tracking-tight">
                  {name}
                </h2>
                <span className="text-2xl font-semibold leading-none opacity-90">
                  {age}
                </span>
                <BadgeCheck className="mb-1 h-5 w-5 fill-sky-400 text-white" />
              </div>
              
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {city}
                </span>
              </div>
              
              <div className="max-h-[4.5rem] overflow-y-auto text-sm leading-snug text-white/85 pr-2">
                {bio}
              </div>
            </div>
          </div>
          <Button 
            onClick={handlePhotoClick}
            className="mt-3 w-full rounded-xl bg-primary hover:bg-primary/90"
          >
            <Upload className="mr-2 h-4 w-4" />
            {photos.length > 0 ? "Добавить фото" : "Добавить, изменить фото"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Thumbnails + delete */}
          {photos.length > 0 && (
            <div className="mt-3 flex gap-3">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p}
                    alt={`thumb-${i}`}
                    onClick={() => setPhotoIndex(i)}
                    className={cn(
                      "h-16 w-24 rounded-lg object-cover cursor-pointer",
                      i === photoIndex ? "ring-2 ring-white" : ""
                    )}
                  />
                  <button
                    onClick={() => handleDeletePhoto(i)}
                    className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                    aria-label={`Удалить фото ${i + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              Имя
            </Label>
            <Input
              id="name"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age" className="text-base font-semibold">
              Возраст
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="28"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-base font-semibold">
              Город
            </Label>
            <Input
              id="city"
              placeholder="Москва"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-base font-semibold">
              О себе
            </Label>
            <Textarea
              id="bio"
              placeholder="Расскажите о себе..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-40 resize-none rounded-xl"
            />
            <p className="text-xs text-muted-foreground">{bio.length}/500</p>
          </div>
        </div>

        <div className="flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
          >
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

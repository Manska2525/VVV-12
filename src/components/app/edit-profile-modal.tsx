"use client";

import { useState, useRef } from "react";
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
import { BadgeCheck, MapPin, Upload } from "lucide-react";
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
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || "");

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoUrl(result);
        console.log("Фото загружено:", file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log({ name, bio, age, city, photoUrl });
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
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt={name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            {/* Photo indicators */}
            <div className="absolute inset-x-0 top-0 z-10 flex gap-1.5 p-3">
              <div className="h-1 flex-1 rounded-full bg-white" />
            </div>

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
            Добавить, изменить фото
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
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

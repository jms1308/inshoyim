
'use client';

import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface FontSettings {
  size: number;
  family: 'font-body' | 'font-headline';
}

interface PostSettingsProps {
  settings: FontSettings;
  onSettingsChange: (settings: FontSettings) => void;
}

export function PostSettings({ settings, onSettingsChange }: PostSettingsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Shrift sozlamalari</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Sozlamalar</h4>
            <p className="text-sm text-muted-foreground">
              Matn ko'rinishini o'zgartiring.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="fontSize">Shrift o'lchami</Label>
              <Slider
                id="fontSize"
                min={12}
                max={24}
                step={1}
                value={[settings.size]}
                onValueChange={(value) =>
                  onSettingsChange({ ...settings, size: value[0] })
                }
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label>Shrift turi</Label>
              <RadioGroup
                value={settings.family}
                onValueChange={(value: 'font-body' | 'font-headline') =>
                  onSettingsChange({ ...settings, family: value })
                }
                className="col-span-2 flex items-center space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="font-body" id="font-sans" />
                  <Label htmlFor="font-sans" className="font-sans">Standart</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="font-headline" id="font-serif" />
                  <Label htmlFor="font-serif" className="font-body">Serif</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

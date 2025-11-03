'use client';

import { getAllColors, ColorOption } from '@/lib/utils/colorUtils';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
}

export function ColorPicker({
  selectedColor,
  onColorSelect,
}: ColorPickerProps) {
  const colors = getAllColors();

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color: ColorOption) => (
        <button
          key={color.id}
          type="button"
          onClick={() => onColorSelect(color.id)}
          className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            selectedColor === color.id
              ? 'border-gray-300 ring-2 ring-gray-300 ring-offset-2 ring-offset-gray-800 scale-110'
              : 'border-gray-600'
          }`}
          style={{ backgroundColor: color.hex }}
          title={color.name}
          aria-label={`Select ${color.name} color`}
        />
      ))}
    </div>
  );
}

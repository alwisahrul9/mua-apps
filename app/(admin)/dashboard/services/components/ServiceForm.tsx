"use client"

import { useActionState, useState } from "react"
import FormActions from "./FormActions"
import { createService, updateService } from "../actions"
import { Brush, Camera, Crown, Heart, Sparkles, Star, Scissors, Flower2, Gem, Wand2 } from "lucide-react"

type Service = {
  id?: string;
  name: string;
  price: number;
  description: string | null;
  iconName?: string;
}

const AVAILABLE_ICONS = [
  { name: "Sparkles", icon: Sparkles },
  { name: "Crown", icon: Crown },
  { name: "Heart", icon: Heart },
  { name: "Camera", icon: Camera },
  { name: "Brush", icon: Brush },
  { name: "Star", icon: Star },
  { name: "Scissors", icon: Scissors },
  { name: "Flower2", icon: Flower2 },
  { name: "Gem", icon: Gem },
  { name: "Wand2", icon: Wand2 },
]

export default function ServiceForm({ service, actionType }: { service?: Service, actionType: "create" | "update" }) {
  const updateAction = service?.id ? updateService.bind(null, service.id) : createService
  const action = actionType === "create" ? createService : updateAction

  const [state, formAction, isPending] = useActionState(action, undefined)
  const [selectedIcon, setSelectedIcon] = useState(service?.iconName || "Sparkles")

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium">
          {state.error}
        </div>
      )}

      {/* Hidden input to pass selected icon */}
      <input type="hidden" name="iconName" value={selectedIcon} />

      <div className="space-y-3">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Ikon Layanan <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
          {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedIcon(name)}
              className={`flex items-center justify-center p-3 rounded-xl border transition-all ${
                selectedIcon === name 
                  ? "bg-primary/10 border-primary text-primary shadow-sm" 
                  : "bg-background border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              title={name}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Nama Layanan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={service?.name}
          required
          placeholder="Contoh: Wedding Makeup"
          className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="price" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Harga (Rp) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="price"
          name="price"
          defaultValue={service?.price}
          required
          min="0"
          placeholder="Contoh: 1500000"
          className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Deskripsi (Opsional)
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={service?.description || ""}
          rows={4}
          placeholder="Tuliskan deskripsi singkat mengenai layanan ini..."
          className="flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        ></textarea>
      </div>

      <FormActions
        submitText={actionType === "create" ? (isPending ? "Menyimpan..." : "Simpan Layanan") : (isPending ? "Menyimpan..." : "Simpan Perubahan")}
        cancelHref={actionType === "create" ? "/dashboard/services" : `/dashboard/services/${service?.id}`}
      />
    </form>
  )
}

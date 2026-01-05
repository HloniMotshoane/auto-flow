// Vehicle Parts Database for Quote Line Items
export const partDescriptions = [
  // Front End
  { value: "BONNET", label: "BONNET", category: "Front" },
  { value: "GRILLE_FRT_BUMPER", label: "GRILLE FRT BUMPER", category: "Front" },
  { value: "L_FRT_BUMPER_TRIM", label: "L/FRT BUMPER TRIM", category: "Front" },
  { value: "R_FRT_BUMPER_TRIM", label: "R/FRT BUMPER TRIM", category: "Front" },
  { value: "FRT_BUMPER_COVER", label: "FRT BUMPER COVER", category: "Front" },
  { value: "FRT_BUMPER_ABSORBER", label: "FRT BUMPER ABSORBER", category: "Front" },
  { value: "FRT_BUMPER_REINFORCEMENT", label: "FRT BUMPER REINFORCEMENT", category: "Front" },
  { value: "HEADLAMP_LH", label: "HEADLAMP L/H", category: "Lighting" },
  { value: "HEADLAMP_RH", label: "HEADLAMP R/H", category: "Lighting" },
  { value: "FOG_LAMP_LH", label: "FOG LAMP L/H", category: "Lighting" },
  { value: "FOG_LAMP_RH", label: "FOG LAMP R/H", category: "Lighting" },
  { value: "INDICATOR_LH", label: "INDICATOR L/H", category: "Lighting" },
  { value: "INDICATOR_RH", label: "INDICATOR R/H", category: "Lighting" },
  
  // Wings/Fenders
  { value: "FRT_WING_LH", label: "FRT WING L/H", category: "Body" },
  { value: "FRT_WING_RH", label: "FRT WING R/H", category: "Body" },
  { value: "REAR_QUARTER_LH", label: "REAR QUARTER L/H", category: "Body" },
  { value: "REAR_QUARTER_RH", label: "REAR QUARTER R/H", category: "Body" },
  { value: "WHEEL_ARCH_LINER_LH", label: "WHEEL ARCH LINER L/H", category: "Body" },
  { value: "WHEEL_ARCH_LINER_RH", label: "WHEEL ARCH LINER R/H", category: "Body" },
  
  // Doors
  { value: "FRT_DOOR_LH", label: "FRT DOOR L/H", category: "Doors" },
  { value: "FRT_DOOR_RH", label: "FRT DOOR R/H", category: "Doors" },
  { value: "REAR_DOOR_LH", label: "REAR DOOR L/H", category: "Doors" },
  { value: "REAR_DOOR_RH", label: "REAR DOOR R/H", category: "Doors" },
  { value: "DOOR_SKIN_FRT_LH", label: "DOOR SKIN FRT L/H", category: "Doors" },
  { value: "DOOR_SKIN_FRT_RH", label: "DOOR SKIN FRT R/H", category: "Doors" },
  { value: "DOOR_SKIN_REAR_LH", label: "DOOR SKIN REAR L/H", category: "Doors" },
  { value: "DOOR_SKIN_REAR_RH", label: "DOOR SKIN REAR R/H", category: "Doors" },
  { value: "DOOR_HANDLE_FRT_LH", label: "DOOR HANDLE FRT L/H", category: "Doors" },
  { value: "DOOR_HANDLE_FRT_RH", label: "DOOR HANDLE FRT R/H", category: "Doors" },
  { value: "DOOR_MIRROR_LH", label: "DOOR MIRROR L/H", category: "Doors" },
  { value: "DOOR_MIRROR_RH", label: "DOOR MIRROR R/H", category: "Doors" },
  
  // Roof & Pillars
  { value: "ROOF_PANEL", label: "ROOF PANEL", category: "Body" },
  { value: "A_PILLAR_LH", label: "A PILLAR L/H", category: "Body" },
  { value: "A_PILLAR_RH", label: "A PILLAR R/H", category: "Body" },
  { value: "B_PILLAR_LH", label: "B PILLAR L/H", category: "Body" },
  { value: "B_PILLAR_RH", label: "B PILLAR R/H", category: "Body" },
  { value: "C_PILLAR_LH", label: "C PILLAR L/H", category: "Body" },
  { value: "C_PILLAR_RH", label: "C PILLAR R/H", category: "Body" },
  
  // Rear End
  { value: "TAILGATE", label: "TAILGATE", category: "Rear" },
  { value: "BOOT_LID", label: "BOOT LID", category: "Rear" },
  { value: "REAR_BUMPER_COVER", label: "REAR BUMPER COVER", category: "Rear" },
  { value: "REAR_BUMPER_ABSORBER", label: "REAR BUMPER ABSORBER", category: "Rear" },
  { value: "REAR_BUMPER_REINFORCEMENT", label: "REAR BUMPER REINFORCEMENT", category: "Rear" },
  { value: "TAIL_LAMP_LH", label: "TAIL LAMP L/H", category: "Lighting" },
  { value: "TAIL_LAMP_RH", label: "TAIL LAMP R/H", category: "Lighting" },
  { value: "REAR_PANEL", label: "REAR PANEL", category: "Rear" },
  { value: "REAR_VALANCE", label: "REAR VALANCE", category: "Rear" },
  
  // Glass
  { value: "WINDSCREEN", label: "WINDSCREEN", category: "Glass" },
  { value: "REAR_WINDSCREEN", label: "REAR WINDSCREEN", category: "Glass" },
  { value: "FRT_DOOR_GLASS_LH", label: "FRT DOOR GLASS L/H", category: "Glass" },
  { value: "FRT_DOOR_GLASS_RH", label: "FRT DOOR GLASS R/H", category: "Glass" },
  { value: "REAR_DOOR_GLASS_LH", label: "REAR DOOR GLASS L/H", category: "Glass" },
  { value: "REAR_DOOR_GLASS_RH", label: "REAR DOOR GLASS R/H", category: "Glass" },
  { value: "QUARTER_GLASS_LH", label: "QUARTER GLASS L/H", category: "Glass" },
  { value: "QUARTER_GLASS_RH", label: "QUARTER GLASS R/H", category: "Glass" },
  
  // Chassis/Frame
  { value: "CHASSIS_LEG_LH", label: "CHASSIS LEG L/H", category: "Frame" },
  { value: "CHASSIS_LEG_RH", label: "CHASSIS LEG R/H", category: "Frame" },
  { value: "RADIATOR_SUPPORT", label: "RADIATOR SUPPORT", category: "Frame" },
  { value: "INNER_WING_LH", label: "INNER WING L/H", category: "Frame" },
  { value: "INNER_WING_RH", label: "INNER WING R/H", category: "Frame" },
  { value: "FLOOR_PAN", label: "FLOOR PAN", category: "Frame" },
  { value: "SILL_PANEL_LH", label: "SILL PANEL L/H", category: "Frame" },
  { value: "SILL_PANEL_RH", label: "SILL PANEL R/H", category: "Frame" },
  
  // Mechanical
  { value: "RADIATOR", label: "RADIATOR", category: "Mechanical" },
  { value: "AC_CONDENSER", label: "A/C CONDENSER", category: "Mechanical" },
  { value: "INTERCOOLER", label: "INTERCOOLER", category: "Mechanical" },
  { value: "SUSPENSION_ARM_LH", label: "SUSPENSION ARM L/H", category: "Mechanical" },
  { value: "SUSPENSION_ARM_RH", label: "SUSPENSION ARM R/H", category: "Mechanical" },
  { value: "SHOCK_ABSORBER_LH", label: "SHOCK ABSORBER L/H", category: "Mechanical" },
  { value: "SHOCK_ABSORBER_RH", label: "SHOCK ABSORBER R/H", category: "Mechanical" },
  { value: "WHEEL_RIM_LH", label: "WHEEL RIM L/H", category: "Mechanical" },
  { value: "WHEEL_RIM_RH", label: "WHEEL RIM R/H", category: "Mechanical" },
  
  // Interior
  { value: "DASHBOARD", label: "DASHBOARD", category: "Interior" },
  { value: "STEERING_WHEEL", label: "STEERING WHEEL", category: "Interior" },
  { value: "AIRBAG_DRIVER", label: "AIRBAG DRIVER", category: "Interior" },
  { value: "AIRBAG_PASSENGER", label: "AIRBAG PASSENGER", category: "Interior" },
  { value: "SEAT_FRT_LH", label: "SEAT FRT L/H", category: "Interior" },
  { value: "SEAT_FRT_RH", label: "SEAT FRT R/H", category: "Interior" },
  { value: "SEAT_REAR", label: "SEAT REAR", category: "Interior" },
  { value: "DOOR_TRIM_FRT_LH", label: "DOOR TRIM FRT L/H", category: "Interior" },
  { value: "DOOR_TRIM_FRT_RH", label: "DOOR TRIM FRT R/H", category: "Interior" },
  
  // Sundries
  { value: "PRIMER", label: "PRIMER", category: "Sundries" },
  { value: "CLEAR_COAT", label: "CLEAR COAT", category: "Sundries" },
  { value: "BASE_COAT", label: "BASE COAT", category: "Sundries" },
  { value: "BLEND_MATERIAL", label: "BLEND MATERIAL", category: "Sundries" },
  { value: "MASKING_MATERIAL", label: "MASKING MATERIAL", category: "Sundries" },
  { value: "CONSUMABLES", label: "CONSUMABLES", category: "Sundries" },
];

export const operations = [
  { value: "adjust", label: "Adjust", color: "bg-orange-600" },
  { value: "labour", label: "Labour", color: "bg-blue-600" },
  { value: "new", label: "New", color: "bg-emerald-600" },
  { value: "r_r", label: "R+R", color: "bg-purple-600" },
  { value: "r_i", label: "R+I", color: "bg-indigo-600" },
  { value: "replace", label: "Replace", color: "bg-green-600" },
  { value: "repair", label: "Repair", color: "bg-yellow-600" },
  { value: "agreed_only", label: "Agreed Only", color: "bg-pink-600" },
  { value: "outwork", label: "Outwork", color: "bg-red-600" },
];

export const getOperationColor = (op: string) => {
  return operations.find((o) => o.value === op)?.color || "bg-slate-600";
};

import {
  getGameDesign,
  interactionLabel,
  type GameDesign,
  type InteractionModel,
} from "@/data/game-design";

type DesignedCategory<T> = {
  slug: string;
  title: string;
  mainSlug: string;
  items: readonly T[];
};

/**
 * PDF'deki öğrenme hedefini temel alan bilinçli oyun ayrımı. Bir kategorinin
 * bütün kartları aynı akışta kalır; böylece etkileşim veri adına göre tesadüfen
 * değişmez ve mobil kullanıcı ne yapacağını oyuna girer girmez anlar.
 */
export function partitionGameItems<T>(category: DesignedCategory<T>): {
  design: GameDesign;
  clickItems: T[];
  dragItems: T[];
  guidedItems: T[];
} {
  const design = getGameDesign(category);
  return {
    design,
    clickItems: design.interaction === "map-select" ? [...category.items] : [],
    dragItems: design.interaction === "drag" ? [...category.items] : [],
    guidedItems: design.interaction === "guided-choice" ? [...category.items] : [],
  };
}

export function gameModeLabel(interaction: InteractionModel): string {
  return interactionLabel(interaction);
}

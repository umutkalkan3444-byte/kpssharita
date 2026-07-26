export const PROVINCE_DROP_KIND = "province";

/**
 * Returns the enabled province droppable whose painted SVG path is really
 * under the pointer. It deliberately ignores dnd-kit's rectangular bounds.
 */
export function findProvinceDropIdAtPoint(clientX: number, clientY: number): string | null {
  if (typeof document === "undefined" || typeof document.elementsFromPoint !== "function") {
    return null;
  }

  for (const element of document.elementsFromPoint(clientX, clientY)) {
    if (element.getAttribute("data-drop-kind") !== PROVINCE_DROP_KIND) continue;
    const dropId = element.getAttribute("data-drop-id");
    if (dropId) return dropId;
  }

  return null;
}

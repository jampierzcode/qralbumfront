import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HolderOutlined } from "@ant-design/icons";

function Row({ id, children, disabled }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      className={`adm-sortable-row ${isDragging ? "is-dragging" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {!disabled && (
        <button type="button" ref={setActivatorNodeRef} className="adm-handle" aria-label="Arrastrar para ordenar" {...attributes} {...listeners}>
          <HolderOutlined />
        </button>
      )}
      {children}
    </div>
  );
}

/** Lista vertical ordenable con asa (mouse, touch y teclado). */
export default function SortableList({ items, getId, renderItem, onReorder, disabled = false }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const ids = items.map(getId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        onReorder(arrayMove(items, ids.indexOf(active.id), ids.indexOf(over.id)));
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="adm-rows">
          {items.map((item) => (
            <Row key={getId(item)} id={getId(item)} disabled={disabled}>
              {renderItem(item)}
            </Row>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Package, CheckCircle, Truck, MapPin } from "lucide-react";

const COLUMNS = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];

function DroppableColumn({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 min-w-[18rem] rounded-xl bg-muted/30 border border-border p-3 ${
        isOver ? "bg-muted/60 ring-2 ring-primary/20" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4 px-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
        {title}
        <Badge variant="secondary" className="font-mono text-xs">
          {React.Children.count(children)}
        </Badge>
      </div>
      <div className="flex-1 space-y-3 min-h-[150px]">{children}</div>
    </div>
  );
}

function DraggableOrderCard({ order, isOverlay = false }: { order: any; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: { order },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging && !isOverlay ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none cursor-grab active:cursor-grabbing">
      <Card className="p-4 border-border bg-card shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            ${(order.totalAmount || 0).toFixed(2)}
          </span>
        </div>
        <div className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-1">
          {order.user?.name || "Guest"}
        </div>
        <div className="text-xs text-muted-foreground flex items-center">
          <MapPin className="w-3 h-3 mr-1" />
          {order.shippingAddress?.city || "No Address"}
        </div>
        <div className="mt-3 pt-3 border-t border-border flex items-center text-xs text-muted-foreground">
          {order.items?.length || 0} items
          {order.ringSize && <span className="ml-auto text-indigo-500 font-medium border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 rounded">Size {order.ringSize}</span>}
        </div>
      </Card>
    </div>
  );
}

export function KanbanBoard({ orders, onStatusChange }: { orders: any[]; onStatusChange: (id: string, status: string) => void }) {
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveOrder(active.data.current?.order);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOrder(null);

    if (!over) return;
    
    const orderId = active.id as string;
    const newStatus = over.id as string;
    const order = active.data.current?.order;

    if (order && order.status !== newStatus) {
      onStatusChange(orderId, newStatus);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full custom-scrollbar">
        {COLUMNS.map((col) => (
          <DroppableColumn key={col} id={col} title={col}>
            {orders.filter((o) => o.status === col).map((order) => (
              <DraggableOrderCard key={order.id} order={order} />
            ))}
          </DroppableColumn>
        ))}
      </div>
      <DragOverlay>
        {activeOrder ? <DraggableOrderCard order={activeOrder} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

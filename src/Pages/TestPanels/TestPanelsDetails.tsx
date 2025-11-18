import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Button, Popover, TextInput } from "@mantine/core";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { notifications } from "@mantine/notifications";
import apis from "../../APis/Api";
import type { TestPanelRow } from "../../APis/Types";
import { IconDots, IconPencil } from "@tabler/icons-react";

// Inline SVG for chevrons up/down
const ChevronsUpDown: React.FC<
  React.SVGProps<SVGSVGElement> & { size?: number }
> = ({ size = 16, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={`${size}px`}
    height={`${size}px`}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    {...props}
  >
    <path
      d="M12.7071 3.29289C12.3166 2.90237 11.6834 2.90237 11.2929 3.29289L6.29289 8.29289C5.90237 8.68342 5.90237 9.31658 6.29289 9.70711C6.68342 10.0976 7.31658 10.0976 7.70711 9.70711L12 5.41421L16.2929 9.70711C16.6834 10.0976 17.3166 10.0976 17.7071 9.70711C18.0976 9.31658 18.0976 8.68342 17.7071 8.29289L12.7071 3.29289Z"
      fill="currentColor"
    />
    <path
      d="M7.70711 14.2929C7.31658 13.9024 6.68342 13.9024 6.29289 14.2929C5.90237 14.6834 5.90237 15.3166 6.29289 15.7071L11.2929 20.7071C11.6834 21.0976 12.3166 21.0976 12.7071 20.7071L17.7071 15.7071C18.0976 15.3166 18.0976 14.6834 17.7071 14.2929C17.3166 13.9024 16.6834 13.9024 16.2929 14.2929L12 18.5858L7.70711 14.2929Z"
      fill="currentColor"
    />
  </svg>
);

import DeleteConfirm from "../TestPackages/Components/DeleteConfirm";

const DEFAULT_PAGE_SIZE = 5;
const DRAG_ACTIVATION_DISTANCE = 8;

interface SortablePanelRowProps {
  panel: TestPanelRow;
  onEdit: (panel: TestPanelRow) => void;
  onDelete: (panel: TestPanelRow) => void;
}

const SortablePanelRow: React.FC<SortablePanelRowProps> = ({
  panel,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: panel.id });

  const rowStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={rowStyle} className="hover:bg-gray-50">
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <ChevronsUpDown size={16} className="text-gray-400" />
          </div>
          <span className="text-sm text-gray-600">{panel.order}.</span>
        </div>
      </td>

      <td className="border-b border-gray-200 px-4 py-3">
        <div className="font-medium text-gray-900">{panel.name}</div>
      </td>

      <td className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-600">{panel.category}</div>
      </td>

      <td className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-600">
          {panel.tests.slice(0, 2).join(", ")}
          {panel.tests.length > 2 && ` (${panel.tests.length} tests)`}
        </div>
      </td>

      <td className="border-b border-gray-200 px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
            onClick={() => onEdit(panel)}
            aria-label="Edit panel"
          >
            <IconPencil size={16} />
          </button>

          <Popover position="bottom" withArrow shadow="md">
            <Popover.Target>
              <button
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="More options"
              >
                <IconDots className="rotate-90" />
              </button>
            </Popover.Target>
            <Popover.Dropdown>
              <div className="flex flex-col gap-2 min-w-max">
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  onClick={() => onDelete(panel)}
                >
                  Remove
                </Button>
              </div>
            </Popover.Dropdown>
          </Popover>
        </div>
      </td>
    </tr>
  );
};

const TestPanelsDetails: React.FC = () => {
  // State: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // State: Data
  const [panels, setPanels] = useState<TestPanelRow[]>([]);

  // State: UI
  const [draggedPanelId, setDraggedPanelId] = useState<string | null>(null);

  // State: Delete Modal
  const [panelToDelete, setPanelToDelete] = useState<TestPanelRow | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const filteredPanels = useMemo(() => {
    if (!searchQuery) return panels;

    const normalizedQuery = searchQuery.toLowerCase();
    return panels.filter(
      (panel) =>
        panel.name.toLowerCase().includes(normalizedQuery) ||
        panel.category.toLowerCase().includes(normalizedQuery) ||
        panel.tests.some((t) => t.toLowerCase().includes(normalizedQuery))
    );
  }, [searchQuery, panels]);

  const sortedPanels = useMemo(() => {
    return [...filteredPanels].sort(
      (a, b) => Number(a.order) - Number(b.order)
    );
  }, [filteredPanels]);

  const draggedPanel = draggedPanelId
    ? panels.find((p) => p.id === draggedPanelId)
    : null;

  const totalPages = Math.max(
    1,
    Math.ceil(sortedPanels.length / DEFAULT_PAGE_SIZE)
  );

  const paginatedPanels = sortedPanels.slice(
    (currentPage - 1) * DEFAULT_PAGE_SIZE,
    currentPage * DEFAULT_PAGE_SIZE
  );

  // ============================================================================
  // Drag and Drop Configuration
  // ============================================================================

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_ACTIVATION_DISTANCE,
      },
    })
  );

  // ============================================================================
  // Notification Helpers
  // ============================================================================

  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "warning") => {
      const colorMap = {
        success: "blue",
        error: "red",
        warning: "yellow",
      };

      notifications.show({
        title: message,
        message,
        color: colorMap[type],
      });
    },
    []
  );

  const showSuccessNotification = useCallback(
    (message: string) => showNotification(message, "success"),
    [showNotification]
  );

  const showErrorNotification = useCallback(
    (message: string) => showNotification(message, "error"),
    [showNotification]
  );

  // ============================================================================
  // API Calls
  // ============================================================================

  const loadPanels = useCallback(async () => {
    try {
      const response = await apis.GetTestPanels();

      if (response.success && response.data?.panels) {
        setPanels(response.data.panels);
      } else {
        showErrorNotification(response.message || "Failed to fetch panels");
      }
    } catch (error) {
      console.error("Failed to load panels:", error);
      showErrorNotification("Failed to fetch panels");
    }
  }, [showErrorNotification]);

  const deletePanel = async (panelId: string) => {
    setIsDeleting(true);

    try {
      const response = await apis.DeleteTestPanel(panelId);

      if (response.success) {
        showSuccessNotification(response.message || "Panel deleted");
        await loadPanels();
      } else {
        showErrorNotification(response.message || "Failed to delete panel");
        removePanelLocally(panelId);
      }

      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete panel:", error);
      showErrorNotification("Panel removed locally");
      removePanelLocally(panelId);
      closeDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const reorderPanels = async (reorderedPanels: TestPanelRow[]) => {
    try {
      const response = await apis.ReorderTestPanels({
        panels: reorderedPanels.map((p, i) => ({
          id: p.id,
          order: i + 1,
        })),
      });

      const notificationType = response.success ? "success" : "error";
      showNotification(response.message, notificationType);

      if (response.success) {
        await loadPanels();
      }
    } catch (error) {
      console.error("Failed to reorder panels:", error);
      showErrorNotification("Failed to sync order");
    }
  };

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedPanelId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedPanelId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = panels.findIndex((p) => p.id === active.id);
    const newIndex = panels.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(panels, oldIndex, newIndex);

    setPanels(reordered);
    await reorderPanels(reordered);
  };

  const handleDeletePanel = (panel: TestPanelRow) => {
    setPanelToDelete(panel);
    setIsDeleteModalOpen(true);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const removePanelLocally = (panelId: string) => {
    setPanels((prevPanels) => prevPanels.filter((p) => p.id !== panelId));
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPanelToDelete(null);
  };

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    loadPanels();
  }, [loadPanels]);

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderPaginationInfo = () => {
    const startIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE + 1;
    const endIndex = Math.min(
      currentPage * DEFAULT_PAGE_SIZE,
      sortedPanels.length
    );

    return (
      <div className="text-sm text-gray-500">
        Showing {startIndex} to {endIndex} of {sortedPanels.length} entries
      </div>
    );
  };

  const renderPageButton = (pageNumber: number) => {
    const isCurrentPage = currentPage === pageNumber;
    const buttonClass = isCurrentPage
      ? "bg-blue-600 text-white"
      : "border text-gray-600 hover:bg-gray-50";

    return (
      <button
        key={pageNumber}
        onClick={() => handlePageChange(pageNumber)}
        className={`w-8 h-8 rounded transition-colors ${buttonClass}`}
        aria-label={`Go to page ${pageNumber}`}
        aria-current={isCurrentPage ? "page" : undefined}
      >
        {pageNumber}
      </button>
    );
  };

  const renderPaginationButtons = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1).map(
      renderPageButton
    );
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">
            Test panel details
          </h2>
          <div className="w-64">
            <TextInput
              placeholder="Search in page"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search panels"
            />
          </div>
        </div>
      </div>

      {/* Table with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Order
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Tests
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              <SortableContext
                items={paginatedPanels.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {paginatedPanels.map((panel) => (
                  <SortablePanelRow
                    key={panel.id}
                    panel={panel}
                    onEdit={() => {
                      // Handle edit - navigate or open modal
                      console.log("Edit panel:", panel);
                    }}
                    onDelete={handleDeletePanel}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedPanel && (
            <div className="bg-white shadow-lg rounded border-2 border-blue-400 opacity-90">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="px-4 py-3 w-20">
                      <div className="flex items-center gap-2">
                        <ChevronsUpDown size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {draggedPanel.order}.
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {draggedPanel.name}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {draggedPanel.category}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {draggedPanel.tests.slice(0, 2).join(", ")}
                        {draggedPanel.tests.length > 2 &&
                          ` (${draggedPanel.tests.length} tests)`}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <IconPencil size={16} className="text-blue-600" />
                        <IconDots className="rotate-90 text-gray-400" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Delete Confirmation Modal */}
      <DeleteConfirm
        opened={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => panelToDelete && deletePanel(panelToDelete.id)}
        itemName={panelToDelete?.name}
        loading={isDeleting}
      />

      {/* Pagination Section */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        {renderPaginationInfo()}

        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            Previous
          </button>

          <div className="inline-flex items-center gap-1">
            {renderPaginationButtons()}
          </div>

          <button
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPanelsDetails;

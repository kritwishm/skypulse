"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import GradientMesh from "@/components/ui/GradientMesh";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FlightGrid from "@/components/dashboard/FlightGrid";
import FlightCard from "@/components/dashboard/FlightCard";
import FlightCardExpanded from "@/components/dashboard/FlightCardExpanded";
import EmptyState from "@/components/dashboard/EmptyState";
import FlightToolbar, { filterFlights } from "@/components/dashboard/FlightToolbar";
import AddFlightModal from "@/components/forms/AddFlightModal";
import DealAlert from "@/components/alerts/DealAlert";
import MobileFAB from "@/components/dashboard/MobileFAB";
import { useFlights, useCreateFlight, useUpdateFlight, useDeleteFlight } from "@/hooks/useFlights";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useDealAlert } from "@/hooks/useDealAlert";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useAuth } from "@/contexts/AuthContext";
import type { FlightWatch, FlightCheckResult, FlightWatchCreate, WSIncoming } from "@/lib/types";

export default function Home() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const { flights, isLoading, refetch } = useFlights();
  const createFlight = useCreateFlight();
  const updateFlightMutation = useUpdateFlight();
  const deleteFlight = useDeleteFlight();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightWatch | null>(null);
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
  const [flightResults, setFlightResults] = useState<Record<string, FlightCheckResult>>({});
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set());
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { showAlert, alertData, triggerAlert, dismissAlert } = useDealAlert();

  const onMessage = useCallback(
    (msg: WSIncoming) => {
      switch (msg.type) {
        case "flight_status":
          if (msg.status === "checking") {
            setCheckingIds((prev) => new Set(prev).add(msg.id));
          }
          break;

        case "flight_result":
          setCheckingIds((prev) => {
            const next = new Set(prev);
            next.delete(msg.id);
            return next;
          });
          setFlightResults((prev) => ({ ...prev, [msg.id]: msg.result }));
          refetch();
          break;

        case "flight_error":
          setCheckingIds((prev) => {
            const next = new Set(prev);
            next.delete(msg.id);
            return next;
          });
          break;

        case "deal_alert":
          triggerAlert({
            id: msg.id,
            message: msg.message,
            cheapest_price: msg.cheapest_price,
            max_price: msg.max_price,
          });
          break;

        case "check_all_complete":
          setIsCheckingAll(false);
          break;
      }
    },
    [refetch, triggerAlert]
  );

  const { isConnected, sendMessage } = useWebSocket({ onMessage });


  const handleCheckAll = useCallback(() => {
    if (!flights?.length) return;
    setIsCheckingAll(true);
    sendMessage({ type: "check_all" });
  }, [flights, sendMessage]);

  const { interval: refreshInterval, setInterval: setRefreshInterval, secondsLeft: refreshSecondsLeft } = useAutoRefresh(handleCheckAll);

  const handleCheckOne = useCallback(
    (id: string) => {
      sendMessage({ type: "check_one", id });
    },
    [sendMessage]
  );

  const handleAddFlight = useCallback(
    (data: FlightWatchCreate) => {
      if (editingFlight) {
        updateFlightMutation.mutate(
          { id: editingFlight.id, data },
          { onSuccess: () => {
            setIsAddModalOpen(false);
            setEditingFlight(null);
            handleCheckOne(editingFlight.id);
          } }
        );
      } else {
        createFlight.mutate(data, {
          onSuccess: (created) => {
            setIsAddModalOpen(false);
            handleCheckOne(created.id);
          },
        });
      }
    },
    [createFlight, updateFlightMutation, editingFlight]
  );

  const handleEditFlight = useCallback(
    (flight: FlightWatch) => {
      setEditingFlight(flight);
      setIsAddModalOpen(true);
    },
    []
  );

  const handleDeleteFlight = useCallback(
    (id: string) => {
      deleteFlight.mutate(id);
      setFlightResults((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [deleteFlight]
  );

  const expandedFlight = flights?.find((f) => f.id === expandedFlightId);
  const expandedResult = expandedFlightId ? flightResults[expandedFlightId] : undefined;

  const flightCurrency = expandedFlight?.currency || "INR";

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="relative min-h-screen">
      <GradientMesh />

      <div className="relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <DashboardHeader
          onAddFlight={() => setIsAddModalOpen(true)}
          onCheckAll={handleCheckAll}
          isChecking={isCheckingAll}
          flightCount={flights?.length || 0}
          isConnected={isConnected}
          refreshInterval={refreshInterval}
          onSetRefreshInterval={setRefreshInterval}
          refreshSecondsLeft={refreshSecondsLeft}
          username={user?.username}
          onLogout={logout}
        />

        <div className="mt-4 sm:mt-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : !flights?.length ? (
            <EmptyState onAddFlight={() => setIsAddModalOpen(true)} />
          ) : (() => {
            const filtered = filterFlights(flights, searchQuery);
            return (
              <div className="flex flex-col gap-4 sm:gap-6">
                <FlightToolbar
                  flights={flights}
                  flightResults={flightResults}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filteredCount={filtered.length}
                />
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <p className="text-sm text-muted">No watches match &ldquo;{searchQuery}&rdquo;</p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <FlightGrid>
                    {filtered.map((flight) => (
                      <FlightCard
                        key={flight.id}
                        flight={flight}
                        result={flightResults[flight.id] || null}
                        isChecking={checkingIds.has(flight.id)}
                        onCheck={() => handleCheckOne(flight.id)}
                        onDelete={() => handleDeleteFlight(flight.id)}
                        onEdit={() => handleEditFlight(flight)}
                        onExpand={() => setExpandedFlightId(flight.id)}
                      />
                    ))}
                  </FlightGrid>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      <AddFlightModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingFlight(null); }}
        onSubmit={handleAddFlight}
        editingFlight={editingFlight}
      />

      <AnimatePresence>
        {expandedFlight && expandedResult && (
          <FlightCardExpanded
            key={expandedFlight.id}
            flight={expandedFlight}
            result={expandedResult}
            onClose={() => setExpandedFlightId(null)}
          />
        )}
      </AnimatePresence>

      <DealAlert
        isVisible={showAlert}
        message={alertData?.message || ""}
        cheapestPrice={alertData?.cheapest_price || 0}
        maxPrice={alertData?.max_price || 0}
        currency={flightCurrency}
        onDismiss={dismissAlert}
      />

      <MobileFAB
        onAddFlight={() => setIsAddModalOpen(true)}
        onCheckAll={handleCheckAll}
        isChecking={isCheckingAll}
        flightCount={flights?.length || 0}
        isConnected={isConnected}
        refreshInterval={refreshInterval}
        onSetRefreshInterval={setRefreshInterval}
        refreshSecondsLeft={refreshSecondsLeft}
        username={user?.username}
        onLogout={logout}
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "lib/apiClient";
import { Card } from "components/ui/Card";
import { Button } from "components/ui/Button";
import { useAuth } from "features/auth/AuthContext";
import { getEmployeeColor } from "lib/colorUtils";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function normalizeDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function startOfCalendarGrid(date) {
  const first = monthStart(date);
  const day = first.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(first);
  start.setDate(first.getDate() + diff);
  return start;
}

function buildGrid(date) {
  const start = startOfCalendarGrid(date);
  return Array.from({ length: 42 }, (_, index) => {
    const cell = new Date(start);
    cell.setDate(start.getDate() + index);
    return cell;
  });
}

function eventForCell(requests, dateKey) {
  return requests.filter((request) => {
    const startDate = normalizeDate(request.startDate);
    const endDate = normalizeDate(request.endDate);
    if (!startDate || !endDate) return false;
    const startKey = toIsoDate(startDate);
    const endKey = toIsoDate(endDate);
    return dateKey >= startKey && dateKey <= endKey;
  });
}

export default function CalendarPage() {
  const [activeMonth, setActiveMonth] = useState(() => new Date());
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["leave-requests", "calendar"],
    queryFn: async () => (await api.get("/leave-requests", { params: { scope: "calendar" } })).data.data,
  });

  const requests = data || [];
  const role = user?.role;

  const visibleRequests = useMemo(() => {
    if (!Array.isArray(requests)) return [];
    return requests;
  }, [requests]);

  const grid = useMemo(() => buildGrid(activeMonth), [activeMonth]);

  const monthLabel = activeMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="grid">
      <Card>
        <div className="section-head">
          <div>
            <h2 style={{ margin: "0 0 0.25rem" }}>Team Calendar</h2>
            <p className="muted" style={{ margin: 0 }}>
              Track leave plans with a single calm timeline view.
            </p>
          </div>

          <div className="dashboard-quick">
            {role === "EMPLOYEE" ? <Link className="btn" href="/leave/apply">+ Add Leave</Link> : null}
          </div>
        </div>

        <div className="calendar-wrap">
          <div className="calendar-header">
            <strong>{monthLabel}</strong>

            <div className="calendar-nav">
              <Button
                className="ghost"
                onClick={() => {
                  setActiveMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
                }}
              >
                Prev
              </Button>
              <Button
                className="ghost"
                onClick={() => {
                  setActiveMonth(new Date());
                }}
              >
                Today
              </Button>
              <Button
                className="ghost"
                onClick={() => {
                  setActiveMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                }}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="calendar-scroll">
            <div className="calendar-grid">
              {weekdays.map((day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              ))}

              {grid.map((day) => {
                const key = toIsoDate(day);
                const inActiveMonth = day.getMonth() === activeMonth.getMonth();
                const isToday = key === toIsoDate(new Date());
                const dayEvents = eventForCell(visibleRequests, key);

                return (
                  <div
                    className={`calendar-cell ${inActiveMonth ? "" : "is-outside"} ${isToday ? "is-today" : ""}`.trim()}
                    key={key}
                  >
                    <div className="cell-date">{day.getDate()}</div>

                    {dayEvents.map((event) => {
                      const colors = getEmployeeColor(event.employee?.id);
                      return (
                        <span
                          className="event-chip"
                          key={`${event.id}-${key}`}
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            borderColor: colors.border,
                            borderWidth: "1.5px",
                          }}
                          title={`${event.employee?.fullName || "Employee"} (${event.employee?.role?.name || "MEMBER"}) | ${
                            event.leaveType?.name || "Leave"
                          }${event.reason ? ` | ${event.reason}` : ""}`}
                        >
                          <span className="event-title">{event.employee?.fullName || "Employee"}</span>
                          <span className="event-meta">
                            {event.employee?.role?.name || "MEMBER"} · {event.leaveType?.name || "Leave"}
                            {event.reason ? ` · ${event.reason}` : ""}
                            {event.status ? ` · ${event.status}` : ""}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

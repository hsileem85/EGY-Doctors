import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  type AppNotification,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "wouter";

export function NotificationBell() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const isAr = lang === "ar";

  const { data: countData } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: getUnreadCount,
    enabled: !!user,
    refetchInterval: 30_000,
  });

  const { data: notifications = [] } = useQuery<AppNotification[]>({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: !!user && open,
  });

  const markOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (!user) return null;

  const unread = countData?.count ?? 0;

  function handleOpen() {
    setOpen(o => !o);
  }

  function getPostUrl(n: AppNotification) {
    if (n.type === "appointment_reminder") return "/patient/dashboard";
    if (n.type === "wallet_low_balance") return "/dashboard?tab=wallet";
    const postId = (n.data as { postId?: number })?.postId;
    return postId ? `/magazine/${postId}` : "/magazine";
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return isAr ? "الآن" : "just now";
    if (mins < 60) return isAr ? `منذ ${mins} د` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return isAr ? `منذ ${hrs} س` : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return isAr ? `منذ ${days} ي` : `${days}d ago`;
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        aria-label={isAr ? "الإشعارات" : "Notifications"}
        className="relative p-1.5 rounded-lg text-gray-400 hover:text-[#D4A853] hover:bg-[#1E293B] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full mt-2 w-80 max-h-[420px] flex flex-col rounded-xl bg-[#1E293B] border border-[#334155] shadow-xl z-50 overflow-hidden"
          style={{ right: isAr ? "auto" : 0, left: isAr ? 0 : "auto" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155]">
            <span className="text-sm font-semibold text-white">
              {isAr ? "الإشعارات" : "Notifications"}
            </span>
            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="text-xs text-[#D4A853] hover:underline disabled:opacity-50"
                disabled={markAll.isPending}
              >
                {isAr ? "تحديد الكل كمقروء" : "Mark all read"}
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">{isAr ? "لا توجد إشعارات" : "No notifications yet"}</p>
              </div>
            ) : (
              notifications.map(n => (
                <Link key={n.id} href={getPostUrl(n)}>
                  <div
                    onClick={() => {
                      if (!n.isRead) markOne.mutate(n.id);
                      setOpen(false);
                    }}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-[#2D3E50] last:border-0 transition-colors ${
                      n.isRead ? "opacity-60 hover:bg-[#243044]" : "hover:bg-[#243044]"
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="mt-1.5 flex-shrink-0">
                      {n.isRead ? (
                        <div className="w-2 h-2 rounded-full bg-transparent" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#D4A853]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white leading-snug truncate">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[11px] text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

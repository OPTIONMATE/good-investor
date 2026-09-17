"use client";

import React, { useEffect, useState } from "react";
import { Search, Download } from "lucide-react";
import AdminPagination from "./ui/AdminPagination";

export default function PaymentAuditSection() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedPaymentId, setExpandedPaymentId] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    activeCount: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments-audit", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setPayments(data.payments || []);
        setFilteredPayments(data.payments || []);
        setStats(data.stats || {});
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.email?.toLowerCase().includes(term) ||
          p.name?.toLowerCase().includes(term) ||
          p.razorpay_payment_id?.includes(term) ||
          p.razorpay_order_id?.includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => {
        const isExpired = new Date(p.expiresAt) < new Date();
        if (statusFilter === "active") return !isExpired;
        if (statusFilter === "expired") return isExpired;
        return true;
      });
    }

    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, payments]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  const downloadCSV = () => {
    const headers = ["Date", "Customer", "Email", "Phone", "Amount", "Payment ID", "Order ID", "Status"];
    const rows = filteredPayments.map((p) => [
      formatDate(p.paidAt),
      p.name,
      p.email,
      p.phone,
      p.amount,
      p.razorpay_payment_id,
      p.razorpay_order_id,
      isExpired(p.expiresAt) ? "Expired" : "Active",
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-audit-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
       
        <button
          type="button"
          onClick={downloadCSV}
          className="inline-flex items-center gap-2 px-4 py-2 cursor-pointer bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition whitespace-nowrap"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-6 border border-blue-200">
          <p className="text-sm text-blue-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-slate-900">
            ₹{stats.totalRevenue?.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-6 border border-green-200">
          <p className="text-sm text-green-600 mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-6 border border-purple-200">
          <p className="text-sm text-purple-600 mb-1">Active Subscriptions</p>
          <p className="text-3xl font-bold text-slate-800">{stats.activeCount}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by username, email, or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-lime-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "expired", label: "Expired" },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                  statusFilter === filter.value
                    ? "bg-lime-500 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <p className="text-sm text-neutral-600">
          Showing {paginatedPayments.length} of {filteredPayments.length} payments
        </p>
      </div>

      {/* Payment History Table */}
      <div className="overflow-x-auto border border-neutral-200 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                DATE
              </th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                CUSTOMER
              </th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                EMAIL
              </th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                PHONE
              </th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                AMOUNT
              </th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                STATUS
              </th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                PAYMENT ID
              </th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                DETAILS
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-neutral-600">
                  No payments found
                </td>
              </tr>
            ) : (
              paginatedPayments.map((payment) => {
                const expired = isExpired(payment.expiresAt);
                const isExpanded = expandedPaymentId === payment._id;
                return (
                  <React.Fragment key={payment._id}>
                    <tr
                      onClick={() => setExpandedPaymentId(isExpanded ? null : payment._id)}
                      className={`border-b border-neutral-100 cursor-pointer transition duration-200 ${
                        isExpanded ? "bg-lime-50" : "hover:bg-neutral-50"
                      }`}
                    >
                      <td className="py-4 px-4 text-sm text-neutral-600">
                        {formatDate(payment.paidAt)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-neutral-900">
                        {payment.name}
                      </td>
                      <td className="py-4 px-4 text-sm text-neutral-600">
                        {payment.email}
                      </td>
                      <td className="py-4 px-4 text-sm text-neutral-600">
                        {payment.phone}
                      </td>
                      <td className="py-4 px-4 font-semibold text-neutral-900">
                        ₹{payment.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            expired
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {expired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-neutral-600">
                        <span title={payment.razorpay_payment_id}>
                          {payment.razorpay_payment_id?.slice(0, 12)}...
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedPaymentId(isExpanded ? null : payment._id);
                          }}
                          className="inline-block px-3 py-1 text-sm text-lime-600 hover:text-lime-700 font-semibold cursor-pointer"
                        >
                          {isExpanded ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-neutral-100 bg-gradient-to-r from-lime-50 via-white to-lime-50 animate-in fade-in duration-300">
                        <td colSpan="8" className="py-6 px-4">
                          <div className="space-y-4">
                            {/* Payment Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Payment ID */}
                              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                                <p className="text-xs font-medium text-neutral-500 mb-1">Payment ID</p>
                                <p className="text-sm font-mono text-neutral-900 break-all">{payment.razorpay_payment_id}</p>
                              </div>

                              {/* Order ID */}
                              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                                <p className="text-xs font-medium text-neutral-500 mb-1">Order ID</p>
                                <p className="text-sm font-mono text-neutral-900 break-all">{payment.razorpay_order_id}</p>
                              </div>

                              {/* Amount */}
                              <div className="bg-gradient-to-br from-lime-50 to-lime-100 rounded-lg p-4 border border-lime-200">
                                <p className="text-xs font-medium text-lime-700 mb-1">Amount Paid</p>
                                <p className="text-lg font-bold text-neutral-900">₹{payment.amount.toLocaleString("en-IN")}</p>
                              </div>

                              {/* Paid At */}
                              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                                <p className="text-xs font-medium text-neutral-500 mb-1">Paid At</p>
                                <p className="text-sm text-neutral-900">{formatDate(payment.paidAt)}</p>
                              </div>

                              {/* Expires At */}
                              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                                <p className="text-xs font-medium text-neutral-500 mb-1">Expires At</p>
                                <p className="text-sm text-neutral-900">{formatDate(payment.expiresAt)}</p>
                              </div>

                              {/* Status */}
                              <div className="bg-white rounded-lg p-4 border border-neutral-200 flex items-end">
                                <div>
                                  <p className="text-xs font-medium text-neutral-500 mb-1">Status</p>
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                    expired
                                      ? "bg-red-100 text-red-700"
                                      : "bg-green-100 text-green-700"
                                  }`}>
                                    {expired ? "Expired" : "Active"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — shared admin control (same component as every section) */}
      {filteredPayments.length > 0 && (
        <AdminPagination
          page={currentPage}
          pageSize={itemsPerPage}
          totalItems={filteredPayments.length}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemLabel={filteredPayments.length === 1 ? "payment" : "payments"}
          emptyMessage="No payments to display on this page."
        />
      )}
    </div>
  );
}

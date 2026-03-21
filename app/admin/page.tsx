"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  TrendingUp,
  ShoppingBag,
  CheckCircle,
  Clock,
  IndianRupee,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  MoreVertical,
  Search,
  ArrowDownRight,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts"

// --- Helper for Price Formatting ---
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

// --- Stat Card Component ---
function StatCard({ title, value, icon: Icon, trend, color, bgColor, isPositive = true }: any) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl hover:border-foreground/10 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-white/5 text-gray-400">
          {isPositive ? <TrendingUp className="w-3 h-3 text-green-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
          {isPositive ? '+12%' : '-2%'}
        </div>
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-foreground mt-1 tracking-tight">{value}</h3>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <span className={color}>{trend}</span>
        </p>
      </div>
    </div>
  )
}

export default function AdminOverview() {
  const [orders, setOrders] = useState<any[]>([])
  const [visitors, setVisitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Time Range State
  const [timeRange, setTimeRange] = useState("30d")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    
    // Fetch Visitor Timestamps
    const { data: vData } = await supabase.from('visitors').select('visited_at')
    if (vData) setVisitors(vData)

    // Fetch Orders
    const { data, error } = await supabase
      .from("orders")
      .select("id, total_amount, status, created_at, customer_email, Address")
      .order("created_at", { ascending: false })

    if (!error && data) {
      let finalOrders = data.map(order => {
        let name = order.customer_email || "Anonymous"
        if (order.Address && typeof order.Address === 'object' && order.Address.first_name) {
          name = `${order.Address.first_name} ${order.Address.last_name || ''}`.trim()
        }
        return { ...order, customer_name: name }
      })

      setOrders(finalOrders)
    } else if (error) {
      console.error("Dashboard fetchOrders error:", error)
    }
    setLoading(false)
  }

  // --- 1. Filter Orders Based on Selected Time Range ---
  const filteredOrders = useMemo(() => {
    if (orders.length === 0) return []
    if (timeRange === "all") return orders

    const now = new Date()
    let startTime = new Date()

    if (timeRange === "7d") startTime.setDate(now.getDate() - 7)
    else if (timeRange === "30d") startTime.setDate(now.getDate() - 30)
    else if (timeRange === "custom" && customStart) startTime = new Date(customStart)

    startTime.setHours(0, 0, 0, 0)
    let endTime = (timeRange === "custom" && customEnd) ? new Date(customEnd) : new Date()
    endTime.setHours(23, 59, 59, 999)

    return orders.filter(o => {
      const orderDate = new Date(o.created_at)
      return orderDate >= startTime && orderDate <= endTime
    })
  }, [orders, timeRange, customStart, customEnd])

  // --- 1.5 Filter Visitors Based on Selected Time Range ---
  const filteredVisitors = useMemo(() => {
    if (visitors.length === 0) return []
    if (timeRange === "all") return visitors

    const now = new Date()
    let startTime = new Date()

    if (timeRange === "7d") startTime.setDate(now.getDate() - 7)
    else if (timeRange === "30d") startTime.setDate(now.getDate() - 30)
    else if (timeRange === "custom" && customStart) startTime = new Date(customStart)

    startTime.setHours(0, 0, 0, 0)
    let endTime = (timeRange === "custom" && customEnd) ? new Date(customEnd) : new Date()
    endTime.setHours(23, 59, 59, 999)

    return visitors.filter(v => {
      const visitDate = new Date(v.visited_at)
      return visitDate >= startTime && visitDate <= endTime
    })
  }, [visitors, timeRange, customStart, customEnd])

  // --- 2. Chart Data logic ---
  const chartData = useMemo(() => {
    if (filteredOrders.length === 0) return []
    const grouped = filteredOrders.reduce((acc, order) => {
      const dateKey = new Date(order.created_at).toLocaleDateString("en-CA")
      if (!acc[dateKey]) acc[dateKey] = { revenue: 0, orders: 0, dateObj: new Date(order.created_at) }
      acc[dateKey].revenue += (order.total_amount || 0)
      acc[dateKey].orders += 1
      return acc
    }, {} as Record<string, any>)

    return Object.entries(grouped)
      .map(([key, val]: any) => ({
        dateStr: key,
        displayDate: val.dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        revenue: val.revenue,
        orders: val.orders
      }))
      .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime())
  }, [filteredOrders])

  // --- 3. Table Search Logic ---
  const searchedOrders = useMemo(() => {
    return orders.filter(o =>
      (o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.id.toString().includes(searchTerm))
    )
  }, [orders, searchTerm])

  // --- 4. Pie Chart Data (Order Status) ---
  const statusDistribution = useMemo(() => {
    if (filteredOrders.length === 0) return []
    const counts = filteredOrders.reduce((acc, order) => {
      const s = order.status || 'unknown'
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filteredOrders])

  const PIE_COLORS = ['#EAB308', '#22C55E', '#3B82F6', '#EF4444', '#F97316']

  const periodRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const avgOrderValue = filteredOrders.length > 0 ? periodRevenue / filteredOrders.length : 0

  if (loading) {
    return (
      <div className="p-10 space-y-8 animate-pulse bg-black min-h-screen">
        <div className="h-10 w-48 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-white/5 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen text-foreground p-4 md:p-8 lg:p-14 space-y-6 md:space-y-10 pb-20 max-w-[1600px] mx-auto overflow-x-hidden">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-yellow-500">Gadgetura Dashboard</h1>
          <p className="text-sm md:text-base text-gray-400 mt-1 font-medium italic">Your store's pulse, updated in real-time.</p>
        </div>

        <div className="flex items-center gap-3 bg-card p-1.5 rounded-xl border border-border shadow-inner">
          {["7d", "30d", "all", "custom"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="text-xs h-8 px-4 capitalize font-bold"
            >
              {range === "all" ? "Lifetime" : range}
            </Button>
          ))}
        </div>
      </div>

      {/* CUSTOM DATE PICKER */}
      {timeRange === "custom" && (
        <div className="flex flex-wrap items-center gap-4 bg-card p-5 rounded-xl border border-border w-fit animate-in fade-in zoom-in-95">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Start Date</label>
            <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="bg-background border-border h-10 text-sm focus:border-yellow-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">End Date</label>
            <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="bg-background border-border h-10 text-sm focus:border-yellow-500" />
          </div>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Revenue" value={formatPrice(periodRevenue)} icon={IndianRupee}
          trend={`${timeRange === 'all' ? 'Lifetime' : 'Period'} Revenue`} color="text-green-400" bgColor="bg-green-400/10"
        />
        <StatCard
          title="Orders" value={filteredOrders.length} icon={ShoppingBag}
          trend="Total items sold" color="text-blue-400" bgColor="bg-blue-400/10"
        />
        <StatCard
          title="Unique Visitors" value={filteredVisitors.length} icon={Users}
          trend={`${timeRange === 'all' ? 'Lifetime' : 'Period'} site visits`} color="text-purple-400" bgColor="bg-purple-400/10"
        />
        <StatCard
          title="Delivered" value={orders.filter(o => o.status === 'delivered').length} icon={CheckCircle}
          trend="Fulfilled successfully" color="text-yellow-500" bgColor="bg-yellow-500/10"
        />
        <StatCard
          title="Pending" value={orders.filter(o => o.status === 'pending').length} icon={Clock}
          trend="Requires attention" color="text-orange-400" bgColor="bg-orange-400/10" isPositive={false}
        />
      </div>

      {/* ANALYTICS SECTION */}
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-full">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-4 md:p-8 shadow-2xl overflow-hidden w-full">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-500" /> Revenue Trend
            </h3>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest bg-muted px-3 py-1 rounded-full border border-border">
              {timeRange === 'all' ? 'Lifetime view' : `Last ${timeRange}`}
            </span>
          </div>

          <div className="h-[250px] md:h-[350px] w-full mt-4 -ml-4 md:ml-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EAB308" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="displayDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#EAB308', fontWeight: 'bold' }}
                    formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#EAB308"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <Calendar className="w-12 h-12 mb-3 opacity-10" />
                <p className="text-sm font-medium">No sales found for this period</p>
              </div>
            )}
          </div>
        </div>

        {/* ORDER DISTRIBUTION PIE CHART */}
        <div className="bg-card border border-border rounded-2xl p-4 md:p-8 flex flex-col shadow-2xl">
          <h3 className="font-bold text-lg md:text-xl mb-4 text-center">Order Status</h3>
          <div className="flex-1 min-h-[250px] w-full relative">
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <p className="text-sm">No orders yet</p>
              </div>
            )}
            {/* Center Stat inside Donut */}
            {statusDistribution.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-2xl font-black">{filteredOrders.length}</span>
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Total</span>
              </div>
            )}
          </div>
        </div>

        {/* INSIGHTS PANEL (Moved to span full width below charts) */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-4 md:p-8 flex flex-col shadow-2xl mt-4">
          <h3 className="font-bold text-lg md:text-xl mb-6 md:mb-8">Quick Intelligence</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 flex-1">
            <div className="p-5 rounded-2xl bg-muted border border-border flex flex-col justify-center">
              <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest">Average Order Value</p>
              <p className="text-3xl font-black mt-2 text-foreground">{formatPrice(avgOrderValue)}</p>
            </div>

            <div className="p-5 rounded-2xl bg-muted border border-border flex flex-col justify-center">
              <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest">Orders Processed</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-black text-foreground">{filteredOrders.length}</p>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Period Summary</p>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                {filteredOrders.length > 0
                  ? `You generated ${formatPrice(periodRevenue)} across ${filteredOrders.length} orders. The busiest day was ${chartData.sort((a, b) => b.revenue - a.revenue)[0]?.displayDate || 'N/A'}.`
                  : "Start processing orders to see your performance metrics here."}
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-6 border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest">
            Download Report
          </Button>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden w-full max-w-full">
        <div className="p-4 md:p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg md:text-xl">Recent Transactions</h3>
          <div className="relative group w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-yellow-500 transition-colors" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer..."
              className="bg-background border border-border rounded-full py-2.5 pl-10 pr-4 text-xs focus:border-yellow-500 outline-none w-full sm:w-72 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-muted">
                <th className="px-4 md:px-8 py-3 md:py-4 font-black">Customer</th>
                <th className="px-4 md:px-8 py-3 md:py-4 font-black">Date</th>
                <th className="px-4 md:px-8 py-3 md:py-4 font-black">Amount</th>
                <th className="px-4 md:px-8 py-3 md:py-4 font-black">Status</th>
                <th className="px-4 md:px-8 py-3 md:py-4 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {searchedOrders.slice(0, 10).map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors group">
                  <td className="px-4 md:px-8 py-4 md:py-5 min-w-[150px]">
                    <p className="font-bold text-foreground group-hover:text-yellow-500 transition-colors">{order.customer_name || 'Anonymous'}</p>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">#{order.id.toString().slice(-6)}</p>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-5 text-muted-foreground font-medium whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-5 font-black text-yellow-500 whitespace-nowrap">{formatPrice(order.total_amount)}</td>
                  <td className="px-4 md:px-8 py-4 md:py-5 min-w-[120px]">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-5 text-right">
                    <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {searchedOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-muted-foreground italic">No transactions found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-center bg-muted">
          <Button variant="ghost" className="text-xs text-muted-foreground font-black tracking-widest uppercase hover:text-foreground group">
            Explore All Transactions <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}
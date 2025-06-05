"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit,
  Trash,
  AlertCircle,
  Code,
  Users,
  BookOpen,
  ArrowRight,
  LogIn,
  Settings,
  Shield,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { FcGoogle } from "react-icons/fc"

// Mock data - this would come from your database
const initialEvents = [
  {
    id: 1,
    title: "Web Development Workshop",
    date: "2025-06-15",
    time: "14:00",
    location: "Lab 203",
    description: "Learn the basics of HTML, CSS, and JavaScript.",
  },
  {
    id: 2,
    title: "Hackathon 2025",
    date: "2025-07-10",
    time: "09:00",
    location: "Main Hall",
    description: "24-hour coding competition with amazing prizes.",
  },
  {
    id: 3,
    title: "AI Study Group",
    date: "2025-06-20",
    time: "16:00",
    location: "Room 105",
    description: "Weekly meeting to discuss AI concepts and applications.",
  },
]

const initialResources = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    url: "https://javascript.info/",
    category: "Web Development",
    description: "Comprehensive guide to JavaScript",
  },
  {
    id: 2,
    title: "React Documentation",
    url: "https://react.dev/",
    category: "Web Development",
    description: "Official React documentation",
  },
  {
    id: 3,
    title: "Python for Data Science",
    url: "https://www.datacamp.com/courses/intro-to-python-for-data-science",
    category: "Data Science",
    description: "Introduction to Python for data analysis",
  },
]

export default function Home() {
  const [events, setEvents] = useState(initialEvents)
  const [resources, setResources] = useState(initialResources)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState("viewer")
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setUser(session.user)

        // Check user role from the database
        try {
          const { data: userRoleData, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single()

          if (userRoleData) {
            setUserRole(userRoleData.role)
          } else {
            // If no role found, check if this is the admin email
            const adminEmail = "admin@devhub.com" // Replace with your actual admin email
            if (session.user.email === adminEmail) {
              setUserRole("admin")
              // Create admin role entry if it doesn't exist
              await supabase.from("user_roles").insert({
                user_id: session.user.id,
                role: "admin",
                email: session.user.email,
              })
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
        }
      }

      setLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUser(session?.user || null)
        setShowLoginModal(false)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setUserRole("viewer")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const canEdit = userRole === "admin" || userRole === "editor"

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Code className="h-6 w-6" />
            <span>DevHub</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#home" className="text-sm font-medium hover:text-primary">
              Home
            </a>
            <a href="#events" className="text-sm font-medium hover:text-primary">
              Events
            </a>
            <a href="#resources" className="text-sm font-medium hover:text-primary">
              Resources
            </a>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{user.email}</span>
                <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  {userRole === "admin" ? "Admin" : userRole === "editor" ? "Editor" : "Viewer"}
                </span>
                {userRole === "admin" && (
                  <Button variant="ghost" size="sm" onClick={() => setShowAdminModal(true)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await supabase.auth.signOut()
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setShowLoginModal(true)}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                DevHub El Shorouk Academy
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Connecting developers, sharing knowledge, and building the future together.
              </p>
            </div>
            <div className="space-x-4">
              <Button onClick={() => document.getElementById("events")?.scrollIntoView({ behavior: "smooth" })}>
                View Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => document.getElementById("resources")?.scrollIntoView({ behavior: "smooth" })}
              >
                Browse Resources
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Community</h3>
              <p className="text-gray-500">Connect with fellow developers and students at El Shorouk Academy.</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Projects</h3>
              <p className="text-gray-500">Showcase your work and collaborate on exciting new projects.</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Resources</h3>
              <p className="text-gray-500">Access learning materials, tutorials, and development resources.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold tracking-tighter">Upcoming Events</h2>
            {canEdit && <AddEventDialog events={events} setEvents={setEvents} />}
          </div>

          {!canEdit && user && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>You are in view-only mode. Contact the admin to request edit access.</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} canEdit={canEdit} events={events} setEvents={setEvents} />
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold tracking-tighter">Learning Resources</h2>
            {canEdit && <AddResourceDialog resources={resources} setResources={setResources} />}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                canEdit={canEdit}
                resources={resources}
                setResources={setResources}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
              © 2025 DevHub El Shorouk Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} supabase={supabase} />

      {/* Admin Modal */}
      {userRole === "admin" && (
        <AdminModal open={showAdminModal} onOpenChange={setShowAdminModal} supabase={supabase} user={user} />
      )}
    </div>
  )
}

// Event Card Component
function EventCard({ event, canEdit, events, setEvents }) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleDelete = () => {
    if (!canEdit) return
    const updatedEvents = events.filter((e) => e.id !== event.id)
    setEvents(updatedEvents)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <div className="flex justify-between">
          <CardDescription>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {event.date}
            </div>
          </CardDescription>
          {canEdit && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{event.location}</span>
          </div>
          <p className="text-gray-500 mt-2">{event.description}</p>
        </div>
      </CardContent>

      {showEditDialog && (
        <EditEventDialog
          event={event}
          events={events}
          setEvents={setEvents}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </Card>
  )
}

// Resource Card Component
function ResourceCard({ resource, canEdit, resources, setResources }) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleDelete = () => {
    if (!canEdit) return
    const updatedResources = resources.filter((r) => r.id !== resource.id)
    setResources(updatedResources)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{resource.title}</CardTitle>
        <div className="flex justify-between">
          <CardDescription>{resource.category}</CardDescription>
          {canEdit && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 text-sm mb-3">{resource.description}</p>
        <Button variant="outline" size="sm" asChild>
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            Visit Resource
          </a>
        </Button>
      </CardContent>

      {showEditDialog && (
        <EditResourceDialog
          resource={resource}
          resources={resources}
          setResources={setResources}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </Card>
  )
}

// Add Event Dialog
function AddEventDialog({ events, setEvents }) {
  const [open, setOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newEvent.title || !newEvent.date) return

    const newId = events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1
    const eventToAdd = { ...newEvent, id: newId }

    setEvents([...events, eventToAdd])
    setNewEvent({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>Fill in the details to add a new community event</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Web Development Workshop"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="Room 101"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Brief description of the event"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Event</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Edit Event Dialog
function EditEventDialog({ event, events, setEvents, open, onOpenChange }) {
  const [editEvent, setEditEvent] = useState(event)

  const handleSubmit = (e) => {
    e.preventDefault()
    const updatedEvents = events.map((e) => (e.id === event.id ? editEvent : e))
    setEvents(updatedEvents)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Update the event details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Event Title</Label>
            <Input
              id="edit-title"
              value={editEvent.title}
              onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editEvent.date}
                onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input
                id="edit-time"
                type="time"
                value={editEvent.time}
                onChange={(e) => setEditEvent({ ...editEvent, time: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={editEvent.location}
              onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={editEvent.description}
              onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Event</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Add Resource Dialog
function AddResourceDialog({ resources, setResources }) {
  const [open, setOpen] = useState(false)
  const [newResource, setNewResource] = useState({
    title: "",
    url: "",
    category: "",
    description: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newResource.title || !newResource.url) return

    const newId = resources.length > 0 ? Math.max(...resources.map((r) => r.id)) + 1 : 1
    const resourceToAdd = { ...newResource, id: newId }

    setResources([...resources, resourceToAdd])
    setNewResource({
      title: "",
      url: "",
      category: "",
      description: "",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
          <DialogDescription>Add a learning resource for the community</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resource-title">Title</Label>
            <Input
              id="resource-title"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              placeholder="JavaScript Fundamentals"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resource-url">URL</Label>
            <Input
              id="resource-url"
              type="url"
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              placeholder="https://example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resource-category">Category</Label>
            <Input
              id="resource-category"
              value={newResource.category}
              onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
              placeholder="Web Development"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resource-description">Description</Label>
            <Input
              id="resource-description"
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              placeholder="Brief description of the resource"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Resource</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Edit Resource Dialog
function EditResourceDialog({ resource, resources, setResources, open, onOpenChange }) {
  const [editResource, setEditResource] = useState(resource)

  const handleSubmit = (e) => {
    e.preventDefault()
    const updatedResources = resources.map((r) => (r.id === resource.id ? editResource : r))
    setResources(updatedResources)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
          <DialogDescription>Update the resource details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-resource-title">Title</Label>
            <Input
              id="edit-resource-title"
              value={editResource.title}
              onChange={(e) => setEditResource({ ...editResource, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-resource-url">URL</Label>
            <Input
              id="edit-resource-url"
              type="url"
              value={editResource.url}
              onChange={(e) => setEditResource({ ...editResource, url: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-resource-category">Category</Label>
            <Input
              id="edit-resource-category"
              value={editResource.category}
              onChange={(e) => setEditResource({ ...editResource, category: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-resource-description">Description</Label>
            <Input
              id="edit-resource-description"
              value={editResource.description}
              onChange={(e) => setEditResource({ ...editResource, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Resource</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Login Modal
function LoginModal({ open, onOpenChange, supabase }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
      setError(error.message || "Failed to login")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      setError(error.message || "Failed to login with Google")
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      setError("Check your email for the confirmation link")
    } catch (error) {
      setError(error.message || "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Create Account" : "Login"}</DialogTitle>
          <DialogDescription>
            {isSignUp ? "Create a new account to join the community" : "Sign in to your account"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div
              className={`p-3 ${error.includes("Check your email") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"} text-sm rounded-md`}
            >
              {error}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FcGoogle className="h-5 w-5" />
            <span>{isSignUp ? "Sign up" : "Sign in"} with Google</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-email">Email</Label>
              <Input
                id="modal-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-password">Password</Label>
              <Input
                id="modal-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isSignUp && <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isSignUp ? "Creating account..." : "Logging in...") : isSignUp ? "Create account" : "Login"}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError("")
              }}
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Admin Modal
function AdminModal({ open, onOpenChange, supabase, user }) {
  const [email, setEmail] = useState("")
  const [editors, setEditors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (open) {
      fetchEditors()
    }
  }, [open])

  const fetchEditors = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      setEditors([
        { id: 1, email: "editor1@gmail.com", created_at: "2025-05-01" },
        { id: 2, email: "editor2@gmail.com", created_at: "2025-05-15" },
      ])
    } catch (error) {
      console.error("Error fetching editors:", error)
    } finally {
      setLoading(false)
    }
  }

  const addEditor = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email || !email.includes("@gmail.com")) {
      setError("Please enter a valid Gmail address")
      return
    }

    try {
      // Mock success for demonstration
      setEditors([...editors, { id: Date.now(), email, created_at: new Date().toISOString().split("T")[0] }])
      setSuccess(`Added ${email} as an editor`)
      setEmail("")
    } catch (error) {
      setError(error.message || "Failed to add editor")
    }
  }

  const removeEditor = async (editorEmail) => {
    try {
      setEditors(editors.filter((editor) => editor.email !== editorEmail))
      setSuccess(`Removed ${editorEmail} from editors`)
    } catch (error) {
      setError(error.message || "Failed to remove editor")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Panel
          </DialogTitle>
          <DialogDescription>
            Manage edit access for your community. Only you and approved editors can modify content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div>
            <h3 className="text-lg font-medium mb-4">Add New Editor</h3>
            <form onSubmit={addEditor} className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="editor@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit">Add Editor</Button>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Current Editors</h3>
            {loading ? (
              <p>Loading...</p>
            ) : editors.length === 0 ? (
              <p className="text-gray-500">No editors added yet</p>
            ) : (
              <div className="space-y-2">
                {editors.map((editor) => (
                  <div key={editor.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{editor.email}</p>
                      <p className="text-sm text-gray-500">Added on {editor.created_at}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeEditor(editor.email)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

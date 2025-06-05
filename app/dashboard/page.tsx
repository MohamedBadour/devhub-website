"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Plus, Edit, Trash, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

export default function Dashboard() {
  const [events, setEvents] = useState(initialEvents)
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
  })
  const [editMode, setEditMode] = useState(false)
  const [currentEventId, setCurrentEventId] = useState(null)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState("viewer") // Default role is viewer
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // Redirect to login if not authenticated
        router.push("/login")
        return
      }

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

      // In a real app, you would fetch events from Supabase here
      // const { data, error } = await supabase.from('events').select('*')
      // if (data) setEvents(data)

      setLoading(false)
    }

    checkUser()
  }, [])

  const canEdit = userRole === "admin" || userRole === "editor"

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewEvent((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddEvent = () => {
    if (!canEdit) return
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

    // In a real app, you would add to Supabase:
    // await supabase.from('events').insert(eventToAdd)
  }

  const handleEditClick = (event) => {
    if (!canEdit) return
    setNewEvent(event)
    setEditMode(true)
    setCurrentEventId(event.id)
  }

  const handleUpdateEvent = () => {
    if (!canEdit) return
    const updatedEvents = events.map((event) => (event.id === currentEventId ? newEvent : event))

    setEvents(updatedEvents)
    setNewEvent({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
    })
    setEditMode(false)
    setCurrentEventId(null)

    // In a real app, you would update in Supabase:
    // await supabase.from('events').update(newEvent).eq('id', currentEventId)
  }

  const handleDeleteEvent = (id) => {
    if (!canEdit) return
    const updatedEvents = events.filter((event) => event.id !== id)
    setEvents(updatedEvents)

    // In a real app, you would delete from Supabase:
    // await supabase.from('events').delete().eq('id', id)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 py-10 flex justify-center items-center min-h-[60vh]">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Logged in as: {user?.email}</span>
          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
            {userRole === "admin" ? "Admin" : userRole === "editor" ? "Editor" : "Viewer"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut()
              router.push("/login")
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {!canEdit && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You are in view-only mode. Contact the admin to request edit access.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          {userRole === "admin" && <TabsTrigger value="permissions">Manage Access</TabsTrigger>}
        </TabsList>

        <TabsContent value="events">
          <div className="grid gap-6 md:grid-cols-2">
            {canEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>{editMode ? "Edit Event" : "Add New Event"}</CardTitle>
                  <CardDescription>
                    {editMode ? "Update the event details below" : "Fill in the details to add a new community event"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={newEvent.title}
                        onChange={handleInputChange}
                        placeholder="Web Development Workshop"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" name="date" type="date" value={newEvent.date} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input id="time" name="time" type="time" value={newEvent.time} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={newEvent.location}
                        onChange={handleInputChange}
                        placeholder="Room 101"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={newEvent.description}
                        onChange={handleInputChange}
                        placeholder="Brief description of the event"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {editMode ? (
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateEvent}>Update Event</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditMode(false)
                          setNewEvent({
                            title: "",
                            date: "",
                            time: "",
                            location: "",
                            description: "",
                          })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleAddEvent}>
                      <Plus className="mr-2 h-4 w-4" /> Add Event
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Upcoming Events</h3>
              {events.map((event) => (
                <Card key={event.id}>
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
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
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
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Learning resources for your community</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                This section displays learning resources, tutorials, and other materials.
                {!canEdit && " Only admins and editors can add or modify resources."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {userRole === "admin" && (
          <TabsContent value="permissions">
            <AccessManagement supabase={supabase} user={user} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function AccessManagement({ supabase, user }) {
  const [email, setEmail] = useState("")
  const [editors, setEditors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchEditors()
  }, [])

  const fetchEditors = async () => {
    setLoading(true)
    try {
      // In a real app, fetch from Supabase
      // const { data, error } = await supabase
      //   .from('user_roles')
      //   .select('*')
      //   .eq('role', 'editor')

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
      // In a real app, you would:
      // 1. Check if the user exists in auth
      // 2. If not, create an invitation
      // 3. Add the user to the user_roles table with 'editor' role

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
      // In a real app, update in Supabase
      // await supabase.from('user_roles').delete().eq('email', editorEmail)

      // Mock update for demonstration
      setEditors(editors.filter((editor) => editor.email !== editorEmail))
      setSuccess(`Removed ${editorEmail} from editors`)
    } catch (error) {
      setError(error.message || "Failed to remove editor")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Access</CardTitle>
        <CardDescription>
          Grant edit access to specific Gmail accounts. Only you (admin) and these editors can modify content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={addEditor} className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="editor-email" className="sr-only">
              Gmail Address
            </Label>
            <Input
              id="editor-email"
              type="email"
              placeholder="editor@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit">Add Editor</Button>
        </form>

        <div>
          <h3 className="text-lg font-medium mb-2">Current Editors</h3>
          {loading ? (
            <p>Loading...</p>
          ) : editors.length === 0 ? (
            <p className="text-gray-500">No editors added yet</p>
          ) : (
            <div className="space-y-2">
              {editors.map((editor) => (
                <div
                  key={editor.id}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                >
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
      </CardContent>
    </Card>
  )
}

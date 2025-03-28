"use client"

import { useState } from "react"
import { Plus, Search, Trash, Edit, MoreHorizontal, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data for prompts
const mockPrompts = [
  {
    id: 1,
    userEmail: "user1@example.com",
    userName: "Alex Johnson",
    name: "Creative Story",
    text: "Write a creative story about a robot who discovers emotions.",
    createdAt: "2023-10-15",
    category: "creative",
  },
  {
    id: 2,
    userEmail: "admin@example.com",
    userName: "Sam Taylor",
    name: "Business Email",
    text: "Draft a professional email to a client about project delays.",
    createdAt: "2023-10-20",
    category: "business",
  },
  {
    id: 3,
    userEmail: "user2@example.com",
    userName: "Jamie Smith",
    name: null,
    text: "Explain quantum computing to a 10-year-old child.",
    createdAt: "2023-10-25",
    category: "educational",
  },
  {
    id: 4,
    userEmail: "developer@example.com",
    userName: "Morgan Lee",
    name: "Code Review",
    text: "Review this code and suggest improvements: [code snippet]",
    createdAt: "2023-10-28",
    category: "technical",
  },
]

// Mock users for the select dropdown
const mockUsers = [
  { id: 1, email: "user1@example.com", name: "Alex Johnson" },
  { id: 2, email: "admin@example.com", name: "Sam Taylor" },
  { id: 3, email: "user2@example.com", name: "Jamie Smith" },
  { id: 4, email: "developer@example.com", name: "Morgan Lee" },
]

type Prompt = {
  id: number
  userEmail: string
  userName: string
  name: string | null
  text: string
  createdAt: string
  category: string
}

export function CustomPrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>(mockPrompts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // New prompt form state
  const [newPromptUser, setNewPromptUser] = useState("")
  const [newPromptName, setNewPromptName] = useState("")
  const [newPromptText, setNewPromptText] = useState("")
  const [newPromptCategory, setNewPromptCategory] = useState("creative")

  // Edit prompt form state
  const [editPromptName, setEditPromptName] = useState("")
  const [editPromptText, setEditPromptText] = useState("")
  const [editPromptCategory, setEditPromptCategory] = useState("")

  const filteredPrompts = prompts.filter(
    (prompt) =>
      prompt.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prompt.name && prompt.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      prompt.text.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddPrompt = () => {
    if (newPromptText && newPromptUser) {
      const selectedUser = mockUsers.find((user) => user.email === newPromptUser)

      const newPrompt = {
        id: prompts.length + 1,
        userEmail: newPromptUser,
        userName: selectedUser?.name || "",
        name: newPromptName || null,
        text: newPromptText,
        createdAt: new Date().toISOString().split("T")[0],
        category: newPromptCategory,
      }
      setPrompts([...prompts, newPrompt])
      setIsAddDialogOpen(false)

      // Reset form
      setNewPromptUser("")
      setNewPromptName("")
      setNewPromptText("")
      setNewPromptCategory("creative")
    }
  }

  const handleEditPrompt = () => {
    if (selectedPrompt && editPromptText) {
      const updatedPrompts = prompts.map((prompt) =>
        prompt.id === selectedPrompt.id
          ? {
              ...prompt,
              name: editPromptName || null,
              text: editPromptText,
              category: editPromptCategory,
            }
          : prompt,
      )
      setPrompts(updatedPrompts)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeletePrompt = () => {
    if (promptToDelete) {
      setPrompts(prompts.filter((prompt) => prompt.id !== promptToDelete.id))
      setPromptToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleEditClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setEditPromptName(prompt.name || "")
    setEditPromptText(prompt.text)
    setEditPromptCategory(prompt.category)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (prompt: Prompt) => {
    setPromptToDelete(prompt)
    setIsDeleteDialogOpen(true)
  }

  const truncateText = (text: string, maxLength = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "creative":
        return "bg-pink-100 text-pink-800 hover:bg-pink-100/80 dark:bg-pink-800/20 dark:text-pink-400"
      case "business":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-800/20 dark:text-blue-400"
      case "educational":
        return "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800/20 dark:text-green-400"
      case "technical":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100/80 dark:bg-amber-800/20 dark:text-amber-400"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800/20 dark:text-gray-400"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Could add a toast notification here
        console.log("Copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Custom Prompts</CardTitle>
            <CardDescription>Manage user-specific prompts and templates</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Prompt
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new custom prompt</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No prompts found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrompts.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials(prompt.userName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{prompt.userName}</span>
                            <span className="text-xs text-muted-foreground">{prompt.userEmail}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{prompt.name || truncateText(prompt.text, 20)}</span>
                          <span className="text-xs text-muted-foreground">{truncateText(prompt.text, 40)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className={getCategoryColor(prompt.category)}>
                          {prompt.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{prompt.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditClick(prompt)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Prompt
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyToClipboard(prompt.text)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Text
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(prompt)}>
                              <Trash className="h-4 w-4 mr-2" />
                              Delete Prompt
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Add New Prompt Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Prompt</DialogTitle>
            <DialogDescription>Create a new custom prompt for a user</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user" className="text-right">
                User
              </Label>
              <Select value={newPromptUser} onValueChange={setNewPromptUser}>
                <SelectTrigger className="col-span-3" id="user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="promptName" className="text-right">
                Prompt Name
              </Label>
              <Input
                id="promptName"
                placeholder="Optional"
                value={newPromptName}
                onChange={(e) => setNewPromptName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={newPromptCategory} onValueChange={setNewPromptCategory}>
                <SelectTrigger className="col-span-3" id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="promptText" className="text-right pt-2">
                Prompt Text
              </Label>
              <Textarea
                id="promptText"
                placeholder="Enter the prompt text..."
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                className="col-span-3 min-h-[150px]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPrompt} disabled={!newPromptText || !newPromptUser}>
              <Check className="h-4 w-4 mr-2" />
              Save Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Prompt Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>Make changes to the prompt</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{selectedPrompt ? getInitials(selectedPrompt.userName) : ""}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{selectedPrompt?.userName}</span>
                <span className="text-sm text-muted-foreground">{selectedPrompt?.userEmail}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editPromptName" className="text-right">
                Prompt Name
              </Label>
              <Input
                id="editPromptName"
                placeholder="Optional"
                value={editPromptName}
                onChange={(e) => setEditPromptName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editCategory" className="text-right">
                Category
              </Label>
              <Select value={editPromptCategory} onValueChange={setEditPromptCategory}>
                <SelectTrigger className="col-span-3" id="editCategory">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="editPromptText" className="text-right pt-2">
                Prompt Text
              </Label>
              <Textarea
                id="editPromptText"
                placeholder="Enter the prompt text..."
                value={editPromptText}
                onChange={(e) => setEditPromptText(e.target.value)}
                className="col-span-3 min-h-[150px]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPrompt} disabled={!editPromptText}>
              <Check className="h-4 w-4 mr-2" />
              Update Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the prompt "
              {promptToDelete?.name || truncateText(promptToDelete?.text || "", 20)}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrompt}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}


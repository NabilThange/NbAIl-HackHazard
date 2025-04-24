"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Lock, Bell, Shield, Upload, Save, Trash2 } from "lucide-react"
import { SparklesCore } from "@/components/sparkles"
import MinimalHeader from "@/components/minimal-header"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Nabil Thange",
    email: "thangenabil@gmail.com",
    bio: "Software engineer passionate about AI and machine learning. Using NbAIl to boost productivity and learn new concepts.",
    location: "Navi Mumbai, IN",
    website: "nabil-t.vercel.app",
    company: "NbAIl",
    role: "Developer",
  })

  const handleSaveProfile = () => {
    // In a real app, this would save to the backend
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative">
      {/* Interactive background with moving particles */}
      <div className="h-full w-full absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={50}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <MinimalHeader title="Profile" />

      <div className="p-6 md:p-8 relative z-10 pt-0">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600">
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-purple-600">
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-600">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-purple-600">
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="md:col-span-2"
              >
                <Card className="bg-gray-800/90 backdrop-blur-md border-gray-700 card-hover">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Profile Information</CardTitle>
                      <CardDescription className="text-gray-400">Update your personal information</CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      className={isEditing ? "bg-purple-600 hover:bg-purple-700" : "border-gray-600"}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <Avatar className="w-20 h-20 border-2 border-purple-500">
                        <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
                        <AvatarFallback className="bg-purple-900 text-white text-xl">AJ</AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button variant="outline" className="border-gray-600 text-white">
                          <Upload className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            disabled={!isEditing}
                            className="pl-10 bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            disabled={!isEditing}
                            className="pl-10 bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio" className="text-gray-300">
                          Bio
                        </Label>
                        <textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          disabled={!isEditing}
                          rows={3}
                          className="w-full rounded-md bg-gray-700 border-gray-600 text-white p-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-gray-300">
                          Location
                        </Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          disabled={!isEditing}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-gray-300">
                          Website
                        </Label>
                        <Input
                          id="website"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                          disabled={!isEditing}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-gray-300">
                          Company
                        </Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                          disabled={!isEditing}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-gray-300">
                          Role
                        </Label>
                        <Input
                          id="role"
                          value={profileData.role}
                          onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                          disabled={!isEditing}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                  {isEditing && (
                    <CardFooter className="border-t border-gray-700 pt-4 flex justify-between">
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>

              {/* Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="bg-gray-800/90 backdrop-blur-md border-gray-700 card-hover">
                  <CardHeader>
                    <CardTitle className="text-white">Usage Statistics</CardTitle>
                    <CardDescription className="text-gray-400">Your NbAIl activity overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Total Messages</p>
                      <div className="flex justify-between items-center">
                        <p className="text-2xl font-bold text-white">1,248</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                          +12% this month
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">AR Mode Usage</p>
                      <div className="flex justify-between items-center">
                        <p className="text-2xl font-bold text-white">3.2 hours</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                          +28% this month
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">ScreenAware Sessions</p>
                      <div className="flex justify-between items-center">
                        <p className="text-2xl font-bold text-white">42</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                          +8% this month
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Current Plan</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xl font-bold text-white">Pro</p>
                        <Button
                          variant="outline"
                          className="h-8 border-purple-500 text-purple-400 hover:bg-purple-500/20"
                        >
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="bg-gray-800/90 backdrop-blur-md border-gray-700 card-hover">
                  <CardHeader>
                    <CardTitle className="text-white">Password</CardTitle>
                    <CardDescription className="text-gray-400">Change your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-gray-300">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="current-password"
                          type="password"
                          className="pl-10 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-gray-300">
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="new-password"
                          type="password"
                          className="pl-10 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-gray-300">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type="password"
                          className="pl-10 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-700 pt-4">
                    <Button className="bg-purple-600 hover:bg-purple-700 ml-auto">Update Password</Button>
                  </CardFooter>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="bg-gray-800/90 backdrop-blur-md border-gray-700 card-hover">
                  <CardHeader>
                    <CardTitle className="text-white">Connected Accounts</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your connected accounts and services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l2.74-2.74C17.05 2.56 14.7 1.5 12 1.5 7.7 1.5 3.99 3.97 2.18 7.57l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">Google</p>
                          <p className="text-gray-400 text-sm">Connected</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-gray-600 text-white">
                        Disconnect
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mr-3">
                          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">GitHub</p>
                          <p className="text-gray-400 text-sm">Connected</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-gray-600 text-white">
                        Disconnect
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">Twitter</p>
                          <p className="text-gray-400 text-sm">Not connected</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="bg-gray-800/90 backdrop-blur-md border-gray-700 card-hover">
                <CardHeader>
                  <CardTitle className="text-white">Notification Preferences</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Email Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Weekly Summary</Label>
                          <p className="text-gray-400 text-sm">Receive a weekly summary of your NbAIl activity</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">New Features</Label>
                          <p className="text-gray-400 text-sm">Get notified about new features and updates</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Tips & Tutorials</Label>
                          <p className="text-gray-400 text-sm">
                            Receive tips and tutorials to get the most out of NbAIl
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">In-App Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Chat Completion</Label>
                          <p className="text-gray-400 text-sm">Get notified when NbAIl completes a complex task</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Usage Limits</Label>
                          <p className="text-gray-400 text-sm">Get notified when approaching usage limits</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">New Messages</Label>
                          <p className="text-gray-400 text-sm">Get notified when you receive new messages</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-700 pt-4">
                  <Button className="bg-purple-600 hover:bg-purple-700 ml-auto">
                    <Bell className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="bg-gray-800/90 backdrop-blur-md border-gray-700 card-hover">
                <CardHeader>
                  <CardTitle className="text-white">Privacy Settings</CardTitle>
                  <CardDescription className="text-gray-400">Control your data and privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Data Collection</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Usage Analytics</Label>
                          <p className="text-gray-400 text-sm">
                            Allow us to collect anonymous usage data to improve NbAIl
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Chat History</Label>
                          <p className="text-gray-400 text-sm">Store your chat history for personalized assistance</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Screen Data</Label>
                          <p className="text-gray-400 text-sm">Allow ScreenAware to process screen content</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Account Privacy</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Two-Factor Authentication</Label>
                          <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                          Enable
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Login History</Label>
                          <p className="text-gray-400 text-sm">View and manage your login sessions</p>
                        </div>
                        <Button variant="outline" className="border-gray-600 text-white">
                          View
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Download Your Data</Label>
                          <p className="text-gray-400 text-sm">Get a copy of all your data stored in NbAIl</p>
                        </div>
                        <Button variant="outline" className="border-gray-600 text-white">
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-700 pt-4">
                  <Button className="bg-purple-600 hover:bg-purple-700 ml-auto">
                    <Shield className="h-4 w-4 mr-2" />
                    Save Privacy Settings
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

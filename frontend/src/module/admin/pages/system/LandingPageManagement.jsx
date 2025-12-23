import { useState, useEffect, useRef } from "react"
import { Upload, Trash2, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2, ArrowUp, ArrowDown, Settings, Layout, Tag, Link as LinkIcon } from "lucide-react"
import api from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LandingPageManagement() {
  const [activeTab, setActiveTab] = useState('banners')
  
  // Hero Banners
  const [banners, setBanners] = useState([])
  const [bannersLoading, setBannersLoading] = useState(true)
  const [bannersUploading, setBannersUploading] = useState(false)
  const [bannersUploadProgress, setBannersUploadProgress] = useState({ current: 0, total: 0 })
  const [bannersDeleting, setBannersDeleting] = useState(null)
  const bannersFileInputRef = useRef(null)

  // Categories
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesUploading, setCategoriesUploading] = useState(false)
  const [categoriesDeleting, setCategoriesDeleting] = useState(null)
  const [pendingCategories, setPendingCategories] = useState([]) // {id, file, label, previewUrl}
  const categoriesFileInputRef = useRef(null)

  // Explore More
  const [exploreMore, setExploreMore] = useState([])
  const [exploreMoreLoading, setExploreMoreLoading] = useState(true)
  const [exploreMoreUploading, setExploreMoreUploading] = useState(false)
  const [exploreMoreDeleting, setExploreMoreDeleting] = useState(null)
  const [exploreMoreLabel, setExploreMoreLabel] = useState("")
  const [exploreMoreLink, setExploreMoreLink] = useState("")
  const exploreMoreFileInputRef = useRef(null)

  // Settings
  const [settings, setSettings] = useState({ exploreMoreHeading: "Explore More" })
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)

  // Common
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Fetch all data on mount
  useEffect(() => {
    fetchBanners()
    fetchCategories()
    fetchExploreMore()
    fetchSettings()
  }, [])

  // ==================== HERO BANNERS ====================
  const fetchBanners = async () => {
    try {
      setBannersLoading(true)
      setError(null)
      const response = await api.get('/hero-banners')
      if (response.data.success) {
        setBanners(response.data.data.banners || [])
      }
    } catch (err) {
      console.error('Error fetching banners:', err)
      setError('Failed to load hero banners. Please try again.')
    } finally {
      setBannersLoading(false)
    }
  }

  const handleBannerFileSelect = (e) => {
    const files = Array.from(e.target?.files || e.files || [])
    if (files.length === 0) return
    if (files.length > 5) {
      setError('You can upload a maximum of 5 images at once')
      return
    }
    uploadBanners(files)
  }

  const uploadBanners = async (files) => {
    try {
      setBannersUploading(true)
      setError(null)
      setSuccess(null)
      setBannersUploadProgress({ current: 0, total: files.length })

      let successCount = 0
      let failCount = 0
      const errors = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          setBannersUploadProgress({ current: i + 1, total: files.length })
          const formData = new FormData()
          formData.append('image', file)
          const response = await api.post('/hero-banners', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          if (response.data.success) successCount++
          else { failCount++; errors.push(`File ${i + 1}: Upload failed`) }
        } catch (err) {
          failCount++
          errors.push(`File ${i + 1}: ${err.response?.data?.message || 'Upload failed'}`)
        }
      }

      await fetchBanners()
      if (bannersFileInputRef.current) bannersFileInputRef.current.value = ''

      if (successCount > 0 && failCount === 0) {
        setSuccess(`${successCount} hero banner${successCount > 1 ? 's' : ''} uploaded successfully!`)
        setTimeout(() => setSuccess(null), 5000)
      } else if (successCount > 0 && failCount > 0) {
        setSuccess(`${successCount} banner${successCount > 1 ? 's' : ''} uploaded, ${failCount} failed.`)
        setError(errors.join(', '))
        setTimeout(() => { setSuccess(null); setError(null) }, 5000)
      } else {
        setError(`Failed to upload banners. ${errors.join(', ')}`)
      }
      setBannersUploadProgress({ current: 0, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload banners.')
      setBannersUploadProgress({ current: 0, total: 0 })
    } finally {
      setBannersUploading(false)
    }
  }

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero banner?')) return
    try {
      setBannersDeleting(id)
      setError(null)
      setSuccess(null)
      const response = await api.delete(`/hero-banners/${id}`)
      if (response.data.success) {
        setSuccess('Hero banner deleted successfully!')
        await fetchBanners()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete banner.')
    } finally {
      setBannersDeleting(null)
    }
  }

  const handleToggleBannerStatus = async (id, currentStatus) => {
    try {
      setError(null)
      setSuccess(null)
      const response = await api.patch(`/hero-banners/${id}/status`)
      if (response.data.success) {
        setSuccess(`Banner ${currentStatus ? 'deactivated' : 'activated'} successfully!`)
        await fetchBanners()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update banner status.')
    }
  }

  const handleBannerOrderChange = async (id, direction) => {
    const banner = banners.find(b => b._id === id)
    if (!banner) return
    const newOrder = direction === 'up' ? banner.order - 1 : banner.order + 1
    const otherBanner = banners.find(b => b.order === newOrder && b._id !== id)
    if (!otherBanner && newOrder < 0) return
    try {
      setError(null)
      await api.patch(`/hero-banners/${id}/order`, { order: newOrder })
      if (otherBanner) {
        await api.patch(`/hero-banners/${otherBanner._id}/order`, { order: banner.order })
      }
      await fetchBanners()
    } catch (err) {
      setError('Failed to update banner order.')
    }
  }

  // ==================== CATEGORIES ====================
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      setError(null)
      const response = await api.get('/hero-banners/landing/categories')
      if (response.data.success) {
        setCategories(response.data.data.categories || [])
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to load categories. Please try again.')
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleCategoryFileSelect = (e) => {
    const files = Array.from(e.target?.files || e.files || [])
    if (!files.length) return

    const newItems = files
      .filter((file) => {
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed for categories')
          return false
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('Each image must be smaller than 5MB')
          return false
        }
        return true
      })
      .map((file, index) => {
        const baseName = file.name.replace(/\.[^/.]+$/, '')
        const prettyName = baseName.replace(/[-_]+/g, ' ').trim()
        return {
          id: `${Date.now()}-${index}`,
          file,
          label: prettyName || '',
          previewUrl: URL.createObjectURL(file),
        }
      })

    if (!newItems.length) return

    setPendingCategories((prev) => [...prev, ...newItems])
    // Reset input so same files can be selected again if needed
    if (categoriesFileInputRef.current) {
      categoriesFileInputRef.current.value = ''
    }
  }

  const handlePendingCategoryLabelChange = (id, newLabel) => {
    setPendingCategories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    )
  }

  const handleRemovePendingCategory = (id) => {
    setPendingCategories((prev) => {
      const toRemove = prev.find((item) => item.id === id)
      if (toRemove?.previewUrl) {
        URL.revokeObjectURL(toRemove.previewUrl)
      }
      return prev.filter((item) => item.id !== id)
    })
  }

  const handleUploadPendingCategories = async () => {
    if (!pendingCategories.length) {
      setError('Add at least one category image before uploading')
      return
    }

    try {
      setCategoriesUploading(true)
      setError(null)
      setSuccess(null)

      let successCount = 0
      let failCount = 0
      const errors = []

      for (let i = 0; i < pendingCategories.length; i++) {
        const item = pendingCategories[i]
        if (!item.label.trim()) {
          failCount++
          errors.push(`Item ${i + 1}: label is required`)
          continue
        }

        const formData = new FormData()
        formData.append('image', item.file)
        formData.append('label', item.label.trim())

        try {
          const response = await api.post('/hero-banners/landing/categories', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          if (response.data.success) {
            successCount++
          } else {
            failCount++
            errors.push(`Item ${i + 1}: upload failed`)
          }
        } catch (err) {
          failCount++
          errors.push(
            `Item ${i + 1}: ${err?.response?.data?.message || 'Failed to create category'}`
          )
        }
      }

      // Clean up previews
      pendingCategories.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl)
        }
      })
      setPendingCategories([])
      if (categoriesFileInputRef.current) categoriesFileInputRef.current.value = ''

      await fetchCategories()

      if (successCount > 0 && failCount === 0) {
        setSuccess(
          `${successCount} categor${successCount > 1 ? 'ies' : 'y'} created successfully!`
        )
        setTimeout(() => setSuccess(null), 4000)
      } else if (successCount > 0 && failCount > 0) {
        setSuccess(
          `${successCount} categor${successCount > 1 ? 'ies' : 'y'} created, ${failCount} failed.`
        )
        setError(errors.join(', '))
        setTimeout(() => {
          setSuccess(null)
          setError(null)
        }, 5000)
      } else {
        setError(`Failed to create categories. ${errors.join(', ')}`)
      }
    } finally {
      setCategoriesUploading(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      setCategoriesDeleting(id)
      setError(null)
      setSuccess(null)
      const response = await api.delete(`/hero-banners/landing/categories/${id}`)
      if (response.data.success) {
        setSuccess('Category deleted successfully!')
        await fetchCategories()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category.')
    } finally {
      setCategoriesDeleting(null)
    }
  }

  const handleToggleCategoryStatus = async (id, currentStatus) => {
    try {
      setError(null)
      setSuccess(null)
      const response = await api.patch(`/hero-banners/landing/categories/${id}/status`)
      if (response.data.success) {
        setSuccess(`Category ${currentStatus ? 'deactivated' : 'activated'} successfully!`)
        await fetchCategories()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category status.')
    }
  }

  const handleCategoryOrderChange = async (id, direction) => {
    const category = categories.find(c => c._id === id)
    if (!category) return
    const newOrder = direction === 'up' ? category.order - 1 : category.order + 1
    const otherCategory = categories.find(c => c.order === newOrder && c._id !== id)
    if (!otherCategory && newOrder < 0) return
    try {
      setError(null)
      await api.patch(`/hero-banners/landing/categories/${id}/order`, { order: newOrder })
      if (otherCategory) {
        await api.patch(`/hero-banners/landing/categories/${otherCategory._id}/order`, { order: category.order })
      }
      await fetchCategories()
    } catch (err) {
      setError('Failed to update category order.')
    }
  }

  // ==================== EXPLORE MORE ====================
  const fetchExploreMore = async () => {
    try {
      setExploreMoreLoading(true)
      setError(null)
      const response = await api.get('/hero-banners/landing/explore-more')
      if (response.data.success) {
        setExploreMore(response.data.data.items || [])
      }
    } catch (err) {
      console.error('Error fetching explore more:', err)
      setError('Failed to load explore more items. Please try again.')
    } finally {
      setExploreMoreLoading(false)
    }
  }

  const handleExploreMoreFileSelect = async (e) => {
    const file = e.target?.files?.[0]
    if (!file) return
    if (!exploreMoreLabel.trim() || !exploreMoreLink.trim()) {
      setError('Please enter both label and link')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB')
      return
    }

    try {
      setExploreMoreUploading(true)
      setError(null)
      setSuccess(null)
      const formData = new FormData()
      formData.append('image', file)
      formData.append('label', exploreMoreLabel.trim())
      formData.append('link', exploreMoreLink.trim())
      const response = await api.post('/hero-banners/landing/explore-more', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (response.data.success) {
        setSuccess('Explore more item created successfully!')
        setExploreMoreLabel("")
        setExploreMoreLink("")
        if (exploreMoreFileInputRef.current) exploreMoreFileInputRef.current.value = ''
        await fetchExploreMore()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create explore more item.')
    } finally {
      setExploreMoreUploading(false)
    }
  }

  const handleDeleteExploreMore = async (id) => {
    if (!window.confirm('Are you sure you want to delete this explore more item?')) return
    try {
      setExploreMoreDeleting(id)
      setError(null)
      setSuccess(null)
      const response = await api.delete(`/hero-banners/landing/explore-more/${id}`)
      if (response.data.success) {
        setSuccess('Explore more item deleted successfully!')
        await fetchExploreMore()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete explore more item.')
    } finally {
      setExploreMoreDeleting(null)
    }
  }

  const handleToggleExploreMoreStatus = async (id, currentStatus) => {
    try {
      setError(null)
      setSuccess(null)
      const response = await api.patch(`/hero-banners/landing/explore-more/${id}/status`)
      if (response.data.success) {
        setSuccess(`Explore more item ${currentStatus ? 'deactivated' : 'activated'} successfully!`)
        await fetchExploreMore()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update explore more status.')
    }
  }

  const handleExploreMoreOrderChange = async (id, direction) => {
    const item = exploreMore.find(e => e._id === id)
    if (!item) return
    const newOrder = direction === 'up' ? item.order - 1 : item.order + 1
    const otherItem = exploreMore.find(e => e.order === newOrder && e._id !== id)
    if (!otherItem && newOrder < 0) return
    try {
      setError(null)
      await api.patch(`/hero-banners/landing/explore-more/${id}/order`, { order: newOrder })
      if (otherItem) {
        await api.patch(`/hero-banners/landing/explore-more/${otherItem._id}/order`, { order: item.order })
      }
      await fetchExploreMore()
    } catch (err) {
      setError('Failed to update explore more order.')
    }
  }

  // ==================== SETTINGS ====================
  const fetchSettings = async () => {
    try {
      setSettingsLoading(true)
      setError(null)
      const response = await api.get('/hero-banners/landing/settings')
      if (response.data.success) {
        setSettings(response.data.data.settings || { exploreMoreHeading: "Explore More" })
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError('Failed to load settings. Please try again.')
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSettingsSaving(true)
      setError(null)
      setSuccess(null)
      const response = await api.patch('/hero-banners/landing/settings', {
        exploreMoreHeading: settings.exploreMoreHeading
      })
      if (response.data.success) {
        setSuccess('Settings saved successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.')
    } finally {
      setSettingsSaving(false)
    }
  }

  // ==================== RENDER ====================
  const tabs = [
    { id: 'banners', label: 'Hero Banners', icon: ImageIcon },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'explore-more', label: 'Explore More', icon: LinkIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Landing Page Management</h1>
              <p className="text-sm text-slate-600 mt-1">Manage hero banners, categories, explore more items, and settings</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Hero Banners Tab */}
        {activeTab === 'banners' && (
          <>
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Upload New Banner(s)</h2>
              <div
                className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50/30 cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50/50"
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const files = Array.from(e.dataTransfer.files)
                  if (files.length > 0) handleBannerFileSelect({ files })
                }}
                onClick={() => bannersFileInputRef.current?.click()}
              >
                <input
                  ref={bannersFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBannerFileSelect}
                  className="hidden"
                  disabled={bannersUploading}
                />
                {bannersUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-blue-600 font-medium">
                      Uploading image {bannersUploadProgress.current} of {bannersUploadProgress.total}...
                    </p>
                    {bannersUploadProgress.total > 0 && (
                      <div className="w-full max-w-xs">
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(bannersUploadProgress.current / bannersUploadProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-8 h-8 text-blue-600" />
                    <div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); bannersFileInputRef.current?.click(); }}
                        className="text-blue-600 font-medium hover:text-blue-700 underline"
                      >
                        Click to upload
                      </button>
                      <span className="text-slate-600"> or drag and drop</span>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB each (Max 5 images at once)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Banners List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Banner List ({banners.length})</h2>
              {bannersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : banners.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p>No banners uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {banners.map((banner, index) => (
                    <div key={banner._id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative aspect-video bg-slate-100">
                        <img src={banner.imageUrl} alt={`Hero Banner ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Order: {banner.order}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleBannerOrderChange(banner._id, 'up')} disabled={index === 0} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50">
                              <ArrowUp className="w-4 h-4 text-slate-600" />
                            </button>
                            <button onClick={() => handleBannerOrderChange(banner._id, 'down')} disabled={index === banners.length - 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50">
                              <ArrowDown className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                          <button onClick={() => handleToggleBannerStatus(banner._id, banner.isActive)} className={`px-3 py-1.5 rounded text-sm font-medium ${banner.isActive ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {banner.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDeleteBanner(banner._id)} disabled={bannersDeleting === banner._id} className="p-1.5 rounded hover:bg-red-100 text-red-600 disabled:opacity-50">
                            {bannersDeleting === banner._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Categories</h2>
              <div className="space-y-4">
                <div>
                  <Label>Category Images (1:1 ratio recommended)</Label>
                  <div
                    className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50/30 cursor-pointer hover:border-blue-400"
                    onClick={() => categoriesFileInputRef.current?.click()}
                  >
                    <input
                      ref={categoriesFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleCategoryFileSelect}
                      className="hidden"
                      disabled={categoriesUploading}
                    />
                    {categoriesUploading ? (
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">
                          Click to select one or more images. Labels will be pre-filled from file
                          names and can be edited.
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG, WEBP up to 5MB each
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {pendingCategories.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Pending Categories ({pendingCategories.length})
                      </h3>
                      <Button
                        size="sm"
                        onClick={handleUploadPendingCategories}
                        disabled={categoriesUploading}
                      >
                        {categoriesUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          'Upload All'
                        )}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingCategories.map((item) => (
                        <div
                          key={item.id}
                          className="border border-slate-200 rounded-lg p-3 flex items-center gap-3 bg-slate-50"
                        >
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                            <img
                              src={item.previewUrl}
                              alt={item.label || 'New category'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label htmlFor={`pending-label-${item.id}`} className="text-xs">
                              Label
                            </Label>
                            <Input
                              id={`pending-label-${item.id}`}
                              value={item.label}
                              onChange={(e) =>
                                handlePendingCategoryLabelChange(item.id, e.target.value)
                              }
                              placeholder="Category name"
                              className="h-8 text-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePendingCategory(item.id)}
                            className="p-1.5 rounded-full hover:bg-red-100 text-red-600 flex-shrink-0"
                            aria-label="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Categories ({categories.length})</h2>
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Tag className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p>No categories added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category, index) => (
                    <div key={category._id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="relative aspect-square bg-slate-100">
                        <img src={category.imageUrl} alt={category.label} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-2">{category.label}</h3>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleCategoryOrderChange(category._id, 'up')} disabled={index === 0} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50">
                              <ArrowUp className="w-4 h-4 text-slate-600" />
                            </button>
                            <button onClick={() => handleCategoryOrderChange(category._id, 'down')} disabled={index === categories.length - 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50">
                              <ArrowDown className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                          <button onClick={() => handleToggleCategoryStatus(category._id, category.isActive)} className={`px-3 py-1.5 rounded text-sm font-medium ${category.isActive ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {category.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDeleteCategory(category._id)} disabled={categoriesDeleting === category._id} className="p-1.5 rounded hover:bg-red-100 text-red-600 disabled:opacity-50">
                            {categoriesDeleting === category._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Explore More Tab */}
        {activeTab === 'explore-more' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Explore More Item</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="explore-label">Label</Label>
                  <Input
                    id="explore-label"
                    value={exploreMoreLabel}
                    onChange={(e) => setExploreMoreLabel(e.target.value)}
                    placeholder="e.g., Offers"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="explore-link">Link</Label>
                  <Input
                    id="explore-link"
                    value={exploreMoreLink}
                    onChange={(e) => setExploreMoreLink(e.target.value)}
                    placeholder="e.g., /user/offers"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Image</Label>
                  <div
                    className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50/30 cursor-pointer hover:border-blue-400"
                    onClick={() => exploreMoreFileInputRef.current?.click()}
                  >
                    <input
                      ref={exploreMoreFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleExploreMoreFileSelect}
                      className="hidden"
                      disabled={exploreMoreUploading}
                    />
                    {exploreMoreUploading ? (
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Click to upload image</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Explore More Items ({exploreMore.length})</h2>
              {exploreMoreLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : exploreMore.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <LinkIcon className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p>No explore more items added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exploreMore.map((item, index) => (
                    <div key={item._id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="relative aspect-square bg-slate-100">
                        <img src={item.imageUrl} alt={item.label} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-1">{item.label}</h3>
                        <p className="text-xs text-slate-500 mb-2">{item.link}</p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleExploreMoreOrderChange(item._id, 'up')} disabled={index === 0} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50">
                              <ArrowUp className="w-4 h-4 text-slate-600" />
                            </button>
                            <button onClick={() => handleExploreMoreOrderChange(item._id, 'down')} disabled={index === exploreMore.length - 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50">
                              <ArrowDown className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                          <button onClick={() => handleToggleExploreMoreStatus(item._id, item.isActive)} className={`px-3 py-1.5 rounded text-sm font-medium ${item.isActive ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {item.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDeleteExploreMore(item._id)} disabled={exploreMoreDeleting === item._id} className="p-1.5 rounded hover:bg-red-100 text-red-600 disabled:opacity-50">
                            {exploreMoreDeleting === item._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Landing Page Settings</h2>
            {settingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="explore-heading">Explore More Section Heading</Label>
                  <Input
                    id="explore-heading"
                    value={settings.exploreMoreHeading}
                    onChange={(e) => setSettings({ ...settings, exploreMoreHeading: e.target.value })}
                    placeholder="Explore More"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleSaveSettings} disabled={settingsSaving} className="w-full">
                  {settingsSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


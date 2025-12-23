// Add new SIR functions
  const openAddDialog = () => {
    setAddDialogOpen(true)
  }

  const handleAddFormChange = (field: string, value: any) => {
    setAddFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const handleAddInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    handleAddFormChange(id, value)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!addFormData.sir_id?.toString().trim()) {
      errors.sir_id = "SIR ID is required"
    }
    if (!addFormData.release_version?.trim()) {
      errors.release_version = "Release Version is required"
    }
    if (!addFormData.bug_severity?.trim()) {
      errors.bug_severity = "Bug Severity is required"
    }
    if (!addFormData.priority?.trim()) {
      errors.priority = "Priority is required"
    }
    if (!addFormData.bug_status?.trim()) {
      errors.bug_status = "Bug Status is required"
    }
    if (!addFormData.short_desc?.trim()) {
      errors.short_desc = "Short Description is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveNewSIR = () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields")
      return
    }

    if (onAddSIR) {
      onAddSIR(addFormData);
      setAddDialogOpen(false)
      toast.success(`Successfully created new SIR ${addFormData.sir_id}`)
      setCurrentPage(1)
    }
  }

  const cancelAdd = () => {
    setAddDialogOpen(false)
  }

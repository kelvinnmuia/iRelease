{/* Add New SIR Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add New SIR
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new SIR with the details below. Fields marked with <span className="text-red-500">*</span> are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 w-full">
            {/* SIR Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="sir_id" className="text-sm font-medium text-gray-700">
                    SIR ID <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="sir_id"
                      type="number"
                      value={addFormData.sir_id || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${validationErrors.sir_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter SIR ID"
                    />
                    {validationErrors.sir_id && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.sir_id}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="release_version" className="text-sm font-medium text-gray-700">
                    Release Version <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="release_version"
                      value={addFormData.release_version || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${validationErrors.release_version ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter release version"
                    />
                    {validationErrors.release_version && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.release_version}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="iteration" className="text-sm font-medium text-gray-700">
                    Iteration
                  </Label>
                  <div className="w-full">
                    <Input
                      id="iteration"
                      value={addFormData.iteration || ''}
                      onChange={handleAddInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter iteration"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="bug_severity" className="text-sm font-medium text-gray-700">
                    Bug Severity <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.bug_severity || ''}
                      onValueChange={(value) => handleAddFormChange('bug_severity', value)}
                    >
                      <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${validationErrors.bug_severity ? 'border-red-500' : 'border-gray-300'
                        }`}>
                        <SelectValue placeholder="Select bug severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {bugSeverityOptions.map((severity) => (
                          <SelectItem key={severity} value={severity.toLowerCase()}>
                            {severity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.bug_severity && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.bug_severity}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                    Priority <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.priority || ''}
                      onValueChange={(value) => handleAddFormChange('priority', value)}
                    >
                      <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${validationErrors.priority ? 'border-red-500' : 'border-gray-300'
                        }`}>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.priority && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.priority}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="bug_status" className="text-sm font-medium text-gray-700">
                    Bug Status <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.bug_status || ''}
                      onValueChange={(value) => handleAddFormChange('bug_status', value)}
                    >
                      <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${validationErrors.bug_status ? 'border-red-500' : 'border-gray-300'
                        }`}>
                        <SelectValue placeholder="Select bug status" />
                      </SelectTrigger>
                      <SelectContent>
                        {bugStatusOptions.map((status) => (
                          <SelectItem key={status} value={status.toUpperCase().replace(' ', '_')}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.bug_status && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.bug_status}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="assigned_to" className="text-sm font-medium text-gray-700">
                    Assigned To
                  </Label>
                  <div className="w-full">
                    <Input
                      id="assigned_to"
                      value={addFormData.assigned_to || ''}
                      onChange={handleAddInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter assigned to email"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="resolution" className="text-sm font-medium text-gray-700">
                    Resolution
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.resolution || ''}
                      onValueChange={(value) => handleAddFormChange('resolution', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutionOptions.map((resolution) => (
                          <SelectItem key={resolution} value={resolution.toUpperCase()}>
                            {resolution}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="component" className="text-sm font-medium text-gray-700">
                    Component
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.component || ''}
                      onValueChange={(value) => handleAddFormChange('component', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select component" />
                      </SelectTrigger>
                      <SelectContent>
                        {componentOptions.map((component) => (
                          <SelectItem key={component} value={component}>
                            {component}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="op_sys" className="text-sm font-medium text-gray-700">
                    Operating System
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.op_sys || ''}
                      onValueChange={(value) => handleAddFormChange('op_sys', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select operating system" />
                      </SelectTrigger>
                      <SelectContent>
                        {osOptions.map((os) => (
                          <SelectItem key={os} value={os}>
                            {os}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="short_desc" className="text-sm font-medium text-gray-700">
                  Short Description <span className="text-red-500">*</span>
                </Label>
                <div className="w-full">
                  <Textarea
                    id="short_desc"
                    value={addFormData.short_desc || ''}
                    onChange={handleAddInputChange}
                    rows={3}
                    className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none ${validationErrors.short_desc ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter short description"
                  />
                  {validationErrors.short_desc && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.short_desc}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="cf_sirwith" className="text-sm font-medium text-gray-700">
                  Cf Sir With
                </Label>
                <div className="w-full">
                  <Input
                    id="cf_sirwith"
                    value={addFormData.cf_sirwith || ''}
                    onChange={handleAddInputChange}
                    className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                    placeholder="Enter cf sir with"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t w-full">
            <Button
              variant="outline"
              onClick={saveNewSIR}
              className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2"
            >
              Create SIR
            </Button>
            <Button
              onClick={cancelAdd}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2"
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

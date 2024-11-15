'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import  Button  from '@src/components/ui/button'
import  Input  from '@src/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@src/components/ui/table'
import { Edit2, Check, X, Plus, Minus } from 'lucide-react'

const initialExercises = {
  day1: ["Press de Banca", "Fondos en Paralelas", "Elevaciones Laterales", "Extensiones de Tríceps"],
  day2: ["Sentadilla", "Prensa", "Curl de Piernas / Extensión de Piernas", "Elevación de Talones"],
  day3: ["Dominadas", "Remo con Barra", "Pull-over", "Curl con Barra"]
}

const RepCounter = ({ id, initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue)

  useEffect(() => {
    const savedCount = localStorage.getItem(id)
    if (savedCount) setCount(parseInt(savedCount, 10))
  }, [id])

  useEffect(() => {
    localStorage.setItem(id, count.toString())
  }, [id, count])

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= 0) {
      setCount(value)
    }
  }

  return (
    <Input
      type="number"
      value={count}
      onChange={handleInputChange}
      className="w-20 text-center"
      min="0"
    />
  )
}

export default function WorkoutTracker() {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek())
  const [exercises, setExercises] = useState(initialExercises)
  const [editingExercise, setEditingExercise] = useState({ day: '', index: -1 })
  const [newExerciseName, setNewExerciseName] = useState('')

  useEffect(() => {
    restoreInputs()
  }, [currentWeek])

  function getCurrentWeek() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7)
  }

  function getWeekDates(week) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (startDate.getDay() + 1) + (week - 1) * 7)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)

    const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
    return `Del ${startDate.toLocaleDateString('es-ES', options)} al ${endDate.toLocaleDateString('es-ES', options)}`
  }

  function saveInputs() {
    document.querySelectorAll('input[type="number"]').forEach(numberInput => {
      localStorage.setItem(numberInput.id, numberInput.value)
    })
  }

  function restoreInputs() {
    document.querySelectorAll('input[type="number"]').forEach(numberInput => {
      numberInput.value = localStorage.getItem(numberInput.id) || ''
    })
  }

  function getExerciseName(day, index) {
    return localStorage.getItem(`exercise-${currentWeek}-${day}-${index}`) || exercises[day][index]
  }

  function setExerciseName(day, index, name) {
    localStorage.setItem(`exercise-${currentWeek}-${day}-${index}`, name)
    setExercises(prev => ({
      ...prev,
      [day]: prev[day].map((exercise, i) => i === index ? name : exercise)
    }))
  }

  function handleSave() {
    saveInputs()
    alert('Progreso guardado con éxito!')
  }

  function handlePrint() {
    let printContent = '<html><head><title>Datos Guardados</title></head><body>'
    printContent += `<h1>Datos Guardados</h1>`

    for (let week = 1; week <= getCurrentWeek(); week++) {
      let weekHasData = false
      let weekContent = `<h2>Semana ${week}</h2>`

      Object.keys(exercises).forEach(day => {
        let dayHasData = false
        let dayContent = `<h3>${day}</h3>`

        exercises[day].forEach((exercise, index) => {
          const reps = [1, 2, 3].map(set => 
            localStorage.getItem(`reps-${week}-${day}-${index}-set${set}`) || '0'
          )
          const kilos = localStorage.getItem(`number-${week}-${day}-${index}`) || ''

          if (reps.some(rep => rep !== '0') || kilos) {
            dayHasData = true
            dayContent += `<p>${getExerciseName(day, index)}:<br> 
              Repeticiones: Set 1: ${reps[0]}, Set 2: ${reps[1]}, Set 3: ${reps[2]} <br> 
              Kilos: ${kilos}</p>`
          }
        })

        if (dayHasData) {
          weekHasData = true
          weekContent += dayContent
        }
      })

      if (weekHasData) {
        printContent += weekContent
      }
    }

    printContent += '</body></html>'

    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  function startEditing(day, index) {
    setEditingExercise({ day, index })
    setNewExerciseName(getExerciseName(day, index))
  }

  function cancelEditing() {
    setEditingExercise({ day: '', index: -1 })
    setNewExerciseName('')
  }

  function saveNewExerciseName() {
    if (newExerciseName.trim() !== '') {
      setExerciseName(editingExercise.day, editingExercise.index, newExerciseName)
    }
    cancelEditing()
  }

  function handleExerciseCountChange(day, newCount) {
    const currentCount = exercises[day].length
    if (newCount > currentCount) {
      const newExercises = [...exercises[day], ...Array(newCount - currentCount).fill("Nuevo Ejercicio")]
      setExercises(prev => ({ ...prev, [day]: newExercises }))
    } else if (newCount < currentCount) {
      const newExercises = exercises[day].slice(0, newCount)
      setExercises(prev => ({ ...prev, [day]: newExercises }))
    }
  }

  const onDragEnd = (result) => {
    if (!result.destination) {
      return
    }

    const sourceDay = result.source.droppableId
    const destinationDay = result.destination.droppableId

    const newExercises = { ...exercises }
    const [reorderedItem] = newExercises[sourceDay].splice(result.source.index, 1)
    newExercises[destinationDay].splice(result.destination.index, 0, reorderedItem)

    setExercises(newExercises)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Registro de Ejercicios Mensuales</h1>
        <div className="flex justify-center items-center mb-4">
          <Button onClick={() => setCurrentWeek(prev => prev > 1 ? prev - 1 : prev)}>Semana Anterior</Button>
          <span className="mx-4 font-bold">Semana {currentWeek}</span>
          <Button onClick={() => setCurrentWeek(prev => prev + 1)}>Semana Siguiente</Button>
        </div>
        <div className="text-center mb-4 text-sm text-gray-600">{getWeekDates(currentWeek)}</div>
        <div className="flex justify-center mb-4 space-x-2">
          <Button onClick={handleSave}>Guardar Progreso</Button>
          <Button onClick={handlePrint}>Imprimir Datos</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(exercises).map(day => (
                <TableHead key={day}>
                  <div className="flex justify-between items-center">
                    <span>{day}</span>
                    <div className="flex items-center">
                      <span className="mr-2">Ejercicios: {exercises[day].length}</span>
                      <Button size="icon" variant="outline" onClick={() => handleExerciseCountChange(day, exercises[day].length - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleExerciseCountChange(day, exercises[day].length + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              {Object.keys(exercises).map(day => (
                <TableCell key={day}>
                  <Droppable droppableId={day}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {exercises[day].map((exercise, index) => (
                          <Draggable key={`${day}-${index}`} draggableId={`${day}-${index}`} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-6 p-2 bg-gray-100 rounded"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  {editingExercise.day === day && editingExercise.index === index ? (
                                    <>
                                      <Input
                                        value={newExerciseName}
                                        onChange={(e) => setNewExerciseName(e.target.value)}
                                        className="mr-2"
                                      />
                                      <div>
                                        <Button size="icon" variant="ghost" onClick={saveNewExerciseName} className="mr-1">
                                          <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={cancelEditing}>
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-medium">{getExerciseName(day, index)}</span>
                                      <Button size="icon" variant="ghost" onClick={() => startEditing(day, index)}>
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  {[1, 2, 3].map(set => (
                                    <div key={`${day}-${index}-set${set}`} className="flex items-center justify-between">
                                      <span className="w-16">Set {set}:</span>
                                      <RepCounter id={`reps-${currentWeek}-${day}-${index}-set${set}`} />
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                  <label htmlFor={`number-${currentWeek}-${day}-${index}`} className="mr-2">Kilos:</label>
                                  <Input
                                    type="number"
                                    id={`number-${currentWeek}-${day}-${index}`}
                                    className="w-20"
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </DragDropContext>
  )
}

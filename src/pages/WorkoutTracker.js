'use client'

import React, { useState, useEffect } from 'react'
import Button from '../components/ui/button'
import Input from '../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Edit2, Check, X, Plus, Minus } from 'lucide-react'

const defaultExercises = ["Press de Banca", "Fondos en Paralelas", "Elevaciones Laterales", "Extensiones de Tríceps"]

function getCurrentWeek() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7)
}

const initialExercises = {
  [getCurrentWeek()]: {
    day1: ["Press de Banca", "Fondos en Paralelas", "Elevaciones Laterales", "Extensiones de Tríceps"],
    day2: ["Sentadilla", "Prensa", "Curl de Piernas / Extensión de Piernas", "Elevación de Talones"],
    day3: ["Dominadas", "Remo con Barra", "Pull-over", "Curl con Barra"]
  }
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
    // Inicializar la semana actual si no existe en el estado
    if (!exercises[currentWeek]) {
      setExercises(prev => ({
        ...prev,
        [currentWeek]: {
          day1: ["Press de Banca", "Fondos en Paralelas", "Elevaciones Laterales", "Extensiones de Tríceps"],
          day2: ["Sentadilla", "Prensa", "Curl de Piernas / Extensión de Piernas", "Elevación de Talones"],
          day3: ["Dominadas", "Remo con Barra", "Pull-over", "Curl con Barra"]
        }
      }))
    }
    restoreInputs()
  }, [currentWeek, exercises])

  function addDay() {
    const currentDays = Object.keys(exercises[currentWeek] || {})
    const newDayNumber = currentDays.length + 1
    const newDayKey = `day${newDayNumber}`
    
    setExercises(prev => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        [newDayKey]: [...defaultExercises]
      }
    }))
  }

  function removeDay() {
    const currentDays = Object.keys(exercises[currentWeek] || {})
    if (currentDays.length <= 1) {
      alert('Debe mantener al menos un día de ejercicios')
      return
    }
    
    const lastDay = currentDays[currentDays.length - 1]
    const { [lastDay]: removedDay, ...remainingDays } = exercises[currentWeek]
    setExercises(prev => ({
      ...prev,
      [currentWeek]: remainingDays
    }))
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
    return localStorage.getItem(`exercise-${currentWeek}-${day}-${index}`) || exercises[currentWeek][day][index]
  }

  function setExerciseName(day, index, name) {
    localStorage.setItem(`exercise-${currentWeek}-${day}-${index}`, name)
    setExercises(prev => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        [day]: prev[currentWeek][day].map((exercise, i) => i === index ? name : exercise)
      }
    }))
  }

  function handleSave() {
    saveInputs()
    alert('Progreso guardado con éxito!')
  }

  function handlePrint() {
    let printContent = '<html><head><title>Datos Guardados</title></head><body>';
    printContent += `<h1>Datos Guardados</h1>`;
  
    const savedWeeks = [];
  
    // Iterar a través de las semanas hasta la semana actual
    for (let week = 1; week <= getCurrentWeek(); week++) {
      let weekHasData = false;
      let weekContent = `<h2>Semana ${week} (${getWeekDates(week)})</h2>`;
  
      // Verificar si la semana existe en "exercises"
      if (exercises[week]) {
        // Iterar a través de los días en la semana
        Object.keys(exercises[week]).forEach(day => {
          // Verificar si el día existe y tiene datos
          if (exercises[week][day]) {
            let dayHasData = false;
            let dayContent = `<h3>${day}</h3>`;
  
            exercises[week][day].forEach((exercise, index) => {
              const reps = [1, 2, 3].map(set =>
                localStorage.getItem(`reps-${week}-${day}-${index}-set${set}`) || '0'
              );
              const kilos = localStorage.getItem(`number-${week}-${day}-${index}`) || '0';
  
              if (reps.some(rep => rep !== '0') || kilos !== '0') {
                dayHasData = true;
                dayContent += `<p>${getExerciseName(day, index)}:<br> 
                  Repeticiones: Set 1: ${reps[0]}, Set 2: ${reps[1]}, Set 3: ${reps[2]} <br> 
                  Kilos: ${kilos}</p>`;
              }
            });
  
            if (dayHasData) {
              weekHasData = true;
              weekContent += dayContent;
            }
          }
        });
      }
  
      if (weekHasData) {
        savedWeeks.push(week);
        printContent += weekContent;
      }
    }
  
    if (savedWeeks.length > 0) {
      printContent += '</body></html>';
      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    } else {
      alert('No hay datos guardados para imprimir.');
    }
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
    const currentCount = exercises[currentWeek][day].length
    if (newCount > currentCount) {
      const newExercises = [...exercises[currentWeek][day], ...Array(newCount - currentCount).fill("Nuevo Ejercicio")]
      setExercises(prev => ({
        ...prev,
        [currentWeek]: {
          ...prev[currentWeek],
          [day]: newExercises
        }
      }))
    } else if (newCount < currentCount) {
      const newExercises = exercises[currentWeek][day].slice(0, newCount)
      setExercises(prev => ({
        ...prev,
        [currentWeek]: {
          ...prev[currentWeek],
          [day]: newExercises
        }
      }))
    }
  }

return (
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
        <Button onClick={removeDay} variant="outline">
          <Minus className="h-4 w-4 mr-2" />
          Quitar Día
        </Button>
        <Button onClick={addDay} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Añadir Día
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {Object.keys(exercises[currentWeek] || {}).map(day => (
              <TableHead key={day}>{day}</TableHead>
            ))}
        </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            {Object.keys(exercises[currentWeek] || {}).map(day => (
              <TableCell key={day}>
                <div className="flex justify-between items-center mb-2">
                  <span className="mr-2">Ejercicios: {exercises[currentWeek][day].length}</span>
                  <div className="flex items-center">
                    <Button size="icon" variant="outline" onClick={() => handleExerciseCountChange(day, exercises[currentWeek][day].length - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => handleExerciseCountChange(day, exercises[currentWeek][day].length + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Table>
                  <TableBody>
                    {exercises[currentWeek][day].map((exercise, index) => (
                      <TableRow key={`${day}-${index}`}>
                        <TableCell>
                          <div className="flex items-center justify-between mb-2">
                            {editingExercise.day === day && editingExercise.index === index? (
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
                            <span className="mr-2" htmlFor={`number-${currentWeek}-${day}-${index}`}>Kilos:</span>
                            <Input
                              type="number"
                              id={`number-${currentWeek}-${day}-${index}`}
                              className="w-20"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

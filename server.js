const express = require('express')
const app = express()
app.use(express.json())
const PORT = 5500
const uuid = require('uuid').v4
const database = require('mysql2')

const sql = database.createConnection({
  database: 'simulation',
  user: 'root',
  password: 'root',
})
sql.connect((err) => {
  if (err) {
    console.log('Error connecting to database', err.message)
  } else {
    console.log('Database connected')
  }
})

// creating students
app.post('/student', (req, res) => {
  const { fullName, stack, email } = req.body

  const query = `INSERT INTO simulation.students(fullName, stack, email) VALUES(?,?,?)`
  try {
    sql.query(query, [fullName, stack, email], (err, data) => {
      if (err) {
        return res.status(400).json({
          message: 'Error',
          error: err.message,
        })
      } else {
        return res.status(201).json({
          message: 'student created successfully',
        })
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating student',
      error: error.message,
    })
  }
})

// creating records in the scores table
app.post('/student/:studentId', (req, res) => {
  const { studentId } = req.params
  const { punctuality, assignment } = req.body

  const totalScore = punctuality + assignment

  const query = `INSERT INTO simulation.scores (student_id, punctuality, assignment, totalScore) VALUES(?,?,?,?) `

  try {
    sql.query(query, [studentId, punctuality, assignment, totalScore], (err, data) => {
      if (err) {
        return res.status(400).json({
          message: 'Error',
          error: err.message,
        })
      } else {
        return res.status(200).json({
          message: 'scores successfully added',
        })
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error adding scores',
      error: error.message,
    })
  }
})

// creating a new student and their score
app.post('/studentAndScore', (req, res) => {
  const { fullName, stack, email, punctuality, assignment } = req.body
  const studentId = uuid()
  const scoreId = uuid()

  const query = `INSERT INTO simulation.students(student_id, fullName, stack, email)VALUES(?,?,?,?)`
  try {
    sql.query(query, [studentId, fullName, stack, email], (err, data) => {
      if (err) {
        return res.status(400).json({
          message: 'Error',
          error: err.message,
        })
      }

      const totalScore = punctuality + assignment

      const scoresQuery = `INSERT INTO simulation.scores(score_id, student_id, punctuality, assignment, totalScore)VALUES(?,?,?,?,?)`

      sql.query(scoresQuery, [scoreId, studentId, punctuality, assignment, totalScore], (err, data) => {
        if (err) {
          return res.status(400).json({
            message: 'Error',
            error: err.message,
          })
        } else {
          return res.status(200).json({
            message: 'Record added successfully',
          })
        }
      })
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error',
      error: error.message,
    })
  }
})

//Retrieve all students and their scores
app.get('/getAllStudents', (req, res) => {
  const query = `SELECT s.fullName, sc.assignment, sc.punctuality, sc.totalScore  FROM simulation.students s JOIN simulation.scores sc ON s.student_id = sc.student_id `

  sql.query(query, (err, data) => {
    if (err) {
      return res.status(400).json({
        message: 'Error',
        error: err.message,
      })
    } else {
      return res.status(500).json({
        message: 'Data retrieved successfully',
        data: data,
      })
    }
  })
  try {
  } catch (error) {
    return res.status(500).json({
      message: 'Error',
      error: error.message,
    })
  }
})

// update a student's stack
app.put('/update/:studentId', (req, res) => {
  const { stack } = req.body
  const { studentId } = req.params

  const query = `UPDATE simulation.students SET stack = ? WHERE student_id = ${studentId} `
  try {
    sql.query(query, [stack, studentId], (err, data) => {
      if (err) {
        return res.status(400).json({
          message: 'Error',
          error: err.message,
        })
      } else {
        return res.status(200).json({
          message: 'Student Stack updated successfully',
        })
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error',
      error: err.message,
    })
  }
})

//delete a student and their score
app.delete('/deleteArecord/:studentId', (req, res) => {
  const { studentId } = req.params
  const query = `DELETE FROM simulation.students WHERE student_id = ${studentId};  `
  sql.query(query, (err, data) => {
    if (err) {
      return res.status(400).json({
        message: 'Error',
        error: err.message,
      })
    } else {
      return res.status(200).json({
        message: 'record deleted successfully',
        data: data,
      })
    }
  })
  try {
  } catch (error) {
    return res.status(500).json({
      message: 'Error',
      error: error.message,
    })
  }
})

// to get all students and their scores and show NULL where no score exists)
app.get('/getAllstudentsWithLeftJoin', (req, res) => {
  try {
    const query = `SELECT students.fullName, scores.totalScore FROM  simulation.students LEFT JOIN simulation.scores ON students.student_id =  scores.student_id`

    sql.query(query, (err, data) => {
      if (err) {
        return res.status(400).json({
          message: 'Error',
          error: err.message,
        })
      } else {
        return res.status(200).json({
          message: 'Successful',
          data: data,
        })
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error',
      error: error.message,
    })
  }
})

// to get all scores and their students (show NULL where no student exists).

app.get('/getAllstudentsWithRightJoin', (req, res) => {
  try {
    const query = `SELECT scores.totalScore, students.fullName FROM simulation.students RIGHT JOIN simulation.scores ON students.student_id = scores.student_id`

    sql.query(query, (err, data) => {
      if (err) {
        return res.status(400).json({
          message: 'Error',
          Error: err.message,
        })
      } else {
        return res.status(200).json({
          message: 'Successfull',
          data: data,
        })
      }
    })
  } catch (error) {
    return res.status(200).json({
      message: 'Successful',
      data: data,
    })
  }
})
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

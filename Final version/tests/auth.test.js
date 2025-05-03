import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../projectserver.mjs' 

describe('Auth Routes', () => {
  const user = {
    email: `test${Date.now()}@example.com`,
    username: `user${Date.now()}`,
    password: 'StrongP@ssword1' // Must meet password requirements
  }

  it('should return 200 OK on /ping', async () => {
    const res = await request(app).get('/ping')
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('message', 'Server is running!')
  })

  it('should reject login with invalid credentials', async () => {
    const res = await request(app).post('/login').send({
      email: 'fake@example.com',
      password: 'WrongPassword123!'
    })
    expect(res.statusCode).toBe(400)
  })

  it('should register a new user', async () => {
    const res = await request(app).post('/register').send(user)
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('message', 'User registered successfully.')
  })

  it('should not allow duplicate registration', async () => {
    const res = await request(app).post('/register').send(user)
    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('message')
  })

  it('should login after successful registration', async () => {
    const res = await request(app).post('/login').send({
      email: user.email,
      password: user.password
    })
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('message', 'Login successful.')
    expect(res.body).toHaveProperty('username', user.username)
  })
})

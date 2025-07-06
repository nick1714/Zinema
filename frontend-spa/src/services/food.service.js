import { API_BASE_URL } from '@/constants'

async function efetch(url, options = {}) {
  let result = {}
  let json = {}

  try {
    result = await fetch(url, options)
    json = await result.json()
  } catch (error) {
    throw new Error(error.message)
  }

  if (!result.ok || json.status !== 'success') {
    throw new Error(json.message || 'Request failed')
  }

  return json.data
}

class FoodService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/foods`
  }

  async getAllFoods(params) {
    const queryParams = new URLSearchParams(params).toString()
    return efetch(`${this.baseUrl}?${queryParams}`)
  }

  async getFoodById(id) {
    return efetch(`${this.baseUrl}/${id}`)
  }
}

export default new FoodService() 
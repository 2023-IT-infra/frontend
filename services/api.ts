// API 기본 URL 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://svr.kiwiwip.duckdns.org"

// 인증 토큰을 헤더에 추가하는 함수
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token")
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

// API 요청 시 발생할 수 있는 오류 처리
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // 응답이 JSON이 아닐 경우 대비
    const errorText = await response.text()
    let errorData
    try {
      errorData = JSON.parse(errorText)
    } catch (e) {
      errorData = { detail: errorText }
    }

    // 401 오류는 인증 만료로 처리
    if (response.status === 401) {
      localStorage.removeItem("auth_token")
      window.location.href = "/"
    }

    throw new Error(errorData.detail || "서버 오류가 발생했습니다.")
  }
  return response.json()
}

// 기기 관련 API 서비스
export const deviceService = {
  // 모든 기기 가져오기
  async getAll() {
    const response = await fetch(`${API_URL}/api/v1/user/devices`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // 특정 기기 가져오기
  async getById(id: string) {
    const response = await fetch(`${API_URL}/api/v1/user/devices/${id}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // 새 기기 추가
  async create(device: Omit<Device, "id" | "addDate">) {
    // FastAPI 모델에 맞게 데이터 변환
    const deviceData = {
      name: device.name,
      mac: device.mac,
      tx_power: Number(device.txPower),
      type: device.type,
      status: Number(device.status === "active")
    }

    const response = await fetch(`${API_URL}/api/v1/user/devices`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(deviceData),
    })

    const data = await handleResponse(response)

    // FastAPI 응답을 클라이언트 모델로 변환
    return {
      id: data.id.toString(),
      name: data.name,
      mac: data.mac,
      txPower: data.tx_power.toString(),
      type: data.type,
      status: data.status === 1 ? "active" : "inactive",
      addDate: data.created_at || new Date().toISOString(),
    }
  },

  // 기기 정보 업데이트
  async update(id: string, device: Partial<Device>) {
    // FastAPI 모델에 맞게 데이터 변환
    const deviceData: any = {}

    if (device.name !== undefined) deviceData.name = device.name
    if (device.mac !== undefined) deviceData.mac = device.mac
    if (device.txPower !== undefined) deviceData.tx_power = Number(device.txPower)
    if (device.type !== undefined) deviceData.type = device.type
    if (device.status !== undefined) deviceData.status = Number(device.status === "active")

    console.log(device.txPower)
    console.log(deviceData)

    const response = await fetch(`${API_URL}/api/v1/user/devices/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(deviceData),
    })

    const data = await handleResponse(response)

    // FastAPI 응답을 클라이언트 모델로 변환
    return {
      id: data.id.toString(),
      name: data.name,
      mac: data.mac,
      txPower: data.tx_power.toString(),
      type: data.type,
      status: data.status === 1 ? "active" : "inactive",
      addDate: data.add_date || new Date().toISOString(),
    }
  },

  // 기기 삭제
  async delete(id: string) {
    const response = await fetch(`${API_URL}/api/v1/user/devices/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      await handleResponse(response)
    }

    return true
  },
}

// 관리자 인증 관련 API 서비스
export const authService = {
  // 로그인
  async login(email: string, password: string) {
    // FastAPI OAuth2 형식에 맞게 데이터 변환
    const formData = new URLSearchParams()
    formData.append("username", email)
    formData.append("password", password)

    const response = await fetch(`${API_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    const data = await handleResponse(response)

    // 토큰 저장
    if (data.access_token) {
      localStorage.setItem("auth_token", data.access_token)
    }

    // 사용자 정보 가져오기
    const userInfo = await this.getCurrentAdmin()

    return {
      token: data.access_token,
      admin: userInfo,
    }
  },

  // 로그아웃
  logout() {
    localStorage.removeItem("auth_token")
  },

  // 현재 로그인한 관리자 정보 가져오기
  async getCurrentAdmin() {
    const response = await fetch(`${API_URL}/api/v1/user/me`, {
      headers: getAuthHeaders(),
    })

    const data = await handleResponse(response)

    // FastAPI 응답을 클라이언트 모델로 변환
    return {
      email: data.email,
      name: data.username,
    }
  },

  // 관리자 정보 업데이트
  async updateProfile(adminData: Partial<Admin>) {
    // FastAPI 모델에 맞게 데이터 변환
    const userData: any = {}

    if (adminData.name !== undefined) userData.full_name = adminData.name
    if (adminData.email !== undefined) userData.email = adminData.email

    const response = await fetch(`${API_URL}/api/v1/user/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    const data = await handleResponse(response)

    // FastAPI 응답을 클라이언트 모델로 변환
    return {
      email: data.email,
      name: data.username,
    }
  },

  // 비밀번호 변경
  async changePassword(currentPassword: string, newPassword: string) {
    const response = await fetch(`${API_URL}/api/v1/user/me/change-password`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })

    await handleResponse(response)
    return true
  },
}

// 타입 정의
export type Device = {
  id: string
  name: string
  mac: string
  txPower: string
  type: string
  status: string
  addDate: string
}

export type Admin = {
  email: string
  name: string
}

// FastAPI 모델과 클라이언트 모델 간 변환 함수
export const mapDeviceFromApi = (apiDevice: any): Device => {
  return {
    id: apiDevice.id.toString(),
    name: apiDevice.name,
    mac: apiDevice.mac,
    txPower: apiDevice.tx_power.toString(),
    type: apiDevice.type,
    status: apiDevice.status === 1 ? "active" : "inactive",
    addDate: apiDevice.add_date || new Date().toISOString(),
  }
}

export const mapDevicesToApi = (devices: any[]): Device[] => {
  return devices.map(mapDeviceFromApi)
}


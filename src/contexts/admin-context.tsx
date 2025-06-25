"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService, type Admin } from "@/services/api"

type AdminContextType = {
  admin: Admin | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateAdmin: (data: Partial<Admin>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  error: string | null
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 페이지 로드 시 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 로컬 스토리지에 토큰이 있는지 확인
        const token = localStorage.getItem("auth_token")

        if (!token) {
          setIsLoading(false)
          return
        }

        // 토큰이 있으면 현재 관리자 정보 가져오기
        const adminData = await authService.getCurrentAdmin()
        setAdmin(adminData)
        setIsAuthenticated(true)
      } catch (err) {
        console.error("인증 확인 오류:", err)
        // 오류 발생 시 로그아웃 처리
        localStorage.removeItem("auth_token")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const data = await authService.login(email, password)
      setAdmin(data.admin)
      setIsAuthenticated(true)
      return true
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("로그인 중 오류가 발생했습니다.")
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setAdmin(null)
    setIsAuthenticated(false)
    router.push("/")
  }

  const updateAdmin = async (data: Partial<Admin>) => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedAdmin = await authService.updateProfile(data)
      setAdmin(updatedAdmin)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("프로필 업데이트 중 오류가 발생했습니다.")
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.changePassword(currentPassword, newPassword)
      return true
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("비밀번호 변경 중 오류가 발생했습니다.")
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated,
        login,
        logout,
        updateAdmin,
        changePassword,
        error,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}


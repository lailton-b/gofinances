import React, { useCallback, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { VictoryPie, } from 'victory-native'
import { addMonths, format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RFValue } from 'react-native-responsive-fontsize'
import { useTheme } from 'styled-components'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

import { HistoryCard } from '../../components/HistoryCard'
import { ASYNC_STORAGE_KEYS } from '../../utils/asyncStorageKeys'
import { categories } from '../../utils/categories'
import { moneyLabel } from '../../utils/fnUtils'
import {
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  SelectIcon,
  Month,
  LoadContainer
} from './styles'
import { useAuth } from '../../hooks/auth'

interface TransactionData {
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface CategoryData {
  key: string;
  name: string;
  total: number;
  totalLabel: string;
  color: string;
  percent
}

export function Resume() {
  const theme = useTheme()
  const { user } = useAuth()
  const bottomTabBarHeight = useBottomTabBarHeight()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [totalAmountByCategories, setTotalAmountByCategories] = useState<CategoryData[]>([])

  function handleDateChange(action: 'next' | 'prev') {
    setIsLoading(true)
    if (action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1))
    } else {
      setSelectedDate(subMonths(selectedDate, 1))
    }
  }

  function getTotalAmountByCategories(transaction: TransactionData[]) {
    const totalAmountByCategories: CategoryData[] = []
    const expensesTotal = transaction.reduce((accumulator, expense) => {
      return accumulator + Number(expense.amount)
    }, 0)

    categories.forEach((category) => {
      let categorySum = 0

      transaction.forEach((expense) => {
        if (expense.category === category.key) {
          categorySum += Number(expense.amount)
        }
      })

      if (categorySum > 0) {
        const percent = (categorySum / expensesTotal * 100).toFixed(0)

        totalAmountByCategories.push({
          key: category.key,
          name: category.name,
          total: categorySum,
          totalLabel: moneyLabel(categorySum),
          color: category.color,
          percent: `${percent}%`
        })
      }
    })

    return totalAmountByCategories
  }

  async function loadData() {
    const response = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.TRANSACTIONS + user.id)
    const transactions: TransactionData[] = response ? JSON.parse(response) : []
    const expenses = transactions.filter(({ type, date }) => 
      type === 'negative' && 
      new Date(date).getMonth() === selectedDate.getMonth() &&
      new Date(date).getFullYear() === selectedDate.getFullYear()
    )

    const totalAmountByCategories = getTotalAmountByCategories(expenses)
    setTotalAmountByCategories(totalAmountByCategories)
    setIsLoading(false)
  }


  useFocusEffect(useCallback(() => {
    loadData()
  }, [selectedDate]))

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>

      <Content
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingBottom: bottomTabBarHeight
        }}
      >
        <MonthSelect>
          <MonthSelectButton onPress={() => handleDateChange('prev')}>
            <SelectIcon name="chevron-left" />
          </MonthSelectButton>

          <Month>{ format(selectedDate, 'MMMM, yyyy', { locale: ptBR }) }</Month>

          <MonthSelectButton onPress={() => handleDateChange('next')}>
            <SelectIcon name="chevron-right" />
          </MonthSelectButton>
        </MonthSelect>

        {isLoading ? (
          <LoadContainer>
            <ActivityIndicator
              color={theme.colors.primary}
              size="large"
            />
          </LoadContainer>
        ) : (
          <>
            <ChartContainer>
              <VictoryPie
                data={totalAmountByCategories}
                colorScale={totalAmountByCategories.map(({ color }) => color)}
                style={{
                  labels: {
                    fontSize: RFValue(18),
                    fontWeight: 'bold',
                    fill: theme.colors.shape
                  }
                }}
                labelRadius={65}
                x="percent"
                y="total"
              />
            </ChartContainer>

            { totalAmountByCategories.map(item => (
              <HistoryCard
                title={item.name}
                amount={item.totalLabel}
                color={item.color}
                key={item.key}
              />
            ))}
          </>
        )}
      </Content>
    </Container>
  )
}
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { useTheme } from 'styled-components'
import { RFValue } from 'react-native-responsive-fontsize'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { 
  Container, 
  Header,
  UserInfo,
  Photo,
  UserWrapper,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer
 } from './styles'

import { HighlightCard } from '../../components/HighlightCard'
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard'
import { ASYNC_STORAGE_KEYS } from '../../utils/asyncStorageKeys'
import { moneyLabel } from '../../utils/fnUtils'

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightProps;
  expenses: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const theme = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<DataListProps[]>([])
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData)
  let entriesSum = 0;
  let expensesSum = 0;

  function dateTwoDigitLabel(date: Date) {
    return Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).format(date)
  }
  function dateLastTransactionLabel(date: Date) {
    return `${date.getDate()} de ${date.toLocaleString('pt-BR', { month: 'long' })}`
  }

  function formatTransaction(item: DataListProps) {
    const amount = moneyLabel(Number(item.amount))
    const date = dateTwoDigitLabel(new Date(item.date))

    if (item.type === 'positive') {
      entriesSum += Number(item.amount)
    }

    if (item.type === 'negative') {
      expensesSum += Number(item.amount)
    }

    return ({
      ...item,
      amount,
      date,
      category: item.category
    })
  }
  function getLastTransactionDate(transactions: DataListProps[], type: 'positive' | 'negative') {
    const transactionsByType = transactions.filter((transaction) => transaction.type === type)
    const transactionsTimestamps = transactionsByType.map(({ date }) => new Date(date).getTime())

    const lastTransactionTimestamp = Math.max.apply(Math, transactionsTimestamps)
    const lastTransactionDate = new Date(lastTransactionTimestamp)
    return lastTransactionDate
  }
  
  async function loadTransactions() {
    entriesSum = 0;
    expensesSum = 0;
    const response = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.TRANSACTIONS)
    const transactions: DataListProps[] = response ? JSON.parse(response) : []
    const transactionsFormatted = transactions.map(formatTransaction)
    const lastEntryTransactionDate = getLastTransactionDate(transactions, 'positive')
    const lastExpenseTransactionDate = getLastTransactionDate(transactions, 'positive')

    const highlightData = {
      entries: {
        amount: moneyLabel(entriesSum),
        lastTransaction: `Última entrada dia ${dateLastTransactionLabel(lastEntryTransactionDate)}`
      },
      expenses: {
        amount: moneyLabel(expensesSum),
        lastTransaction: `Última saída dia ${dateLastTransactionLabel(lastExpenseTransactionDate)}`
      },
      total: {
        amount: moneyLabel(entriesSum - expensesSum),
        lastTransaction: `01 à ${dateLastTransactionLabel(lastExpenseTransactionDate)}`
      }
    }

    setTransactions(transactionsFormatted)
    setHighlightData(highlightData)
    setIsLoading(false)
  }

  useFocusEffect(useCallback(() => {
    loadTransactions();
  }, []))

  if (isLoading) return (
    <LoadContainer>
      <ActivityIndicator
        color={theme.colors.primary}
        size='large'
      />
    </LoadContainer>
  )

  return (
    <Container>
      <Header>

        <UserWrapper>
          <UserInfo>
            <Photo source={{ uri: 'https://avatars.githubusercontent.com/u/54367053?v=4' }} />
            <User>
              <UserGreeting>Olá,</UserGreeting>
              <UserName>Lailton</UserName>
            </User>
          </UserInfo>

        <LogoutButton onPress={() => {}}>
          <Icon name="power" size={RFValue(24)} color="#FFF" />
        </LogoutButton>

        </UserWrapper>
      </Header>

      <HighlightCards>
        <HighlightCard
          type="up"
          title="Entradas" 
          amount={highlightData.entries.amount}
          lastTransaction={highlightData.entries.lastTransaction}
        />
        <HighlightCard 
          type="down"
          title="Saídas" 
          amount={highlightData.expenses.amount}
          lastTransaction={highlightData.expenses.lastTransaction}
        />
        <HighlightCard 
          type="total"
          title="Total" 
          amount={highlightData.total.amount}
          lastTransaction={highlightData.total.lastTransaction}
        />
      </HighlightCards>

      <Transactions>
        <Title>Listagem</Title>

        <TransactionList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TransactionCard data={item} />}
        />
      </Transactions>
    </Container>
  )
}

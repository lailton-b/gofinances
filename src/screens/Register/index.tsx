import React, { useEffect, useState } from 'react'
import { Alert, Keyboard, Modal, TouchableWithoutFeedback } from 'react-native'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'react-native-uuid'

import { Button } from '../../components/Forms/Button'
import { CategorySelectButton } from '../../components/Forms/CategorySelectButton'
import { InputForm } from '../../components/Forms/InputForm'
import { TransactionTypeButton } from '../../components/Forms/TransactionTypeButton'
import { CategorySelect } from '../CategorySelect'
import { 
  Container,
  Header,
  Title,
  Form,
  Fields,
  TransactionsTypes
} from './styles'
import { useNavigation } from '@react-navigation/native'
import { ASYNC_STORAGE_KEYS } from '../../utils/asyncStorageKeys'

interface FormData {
  name: string;
  amount: string;
}

const schema = Yup.object().shape({
  name: Yup
    .string()
    .required('Nome é obrigatório'),
  amount: Yup
    .number()
    .typeError('Informe um valor númerico')
    .positive('O valor não pode ser negativo')
    .required('Informe um valor númerico')
})

export function Register() {
  const [transactionType, setTransactionType] = useState('')
  const [category, setCategory] = useState({
    key: 'category',
    name: 'Categoria',
  })
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)

  const navigation = useNavigation()
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  function handleTransactionsTypeSelect(type: 'positive' | 'negative') {
    setTransactionType(type)
  }

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true)
  }

  function handleCloseSelectCategoryModal() {
    setCategoryModalOpen(false)
  }

  async function handleRegister(form: FormData) {
    if (!transactionType) {
      return Alert.alert('Selecione o tipo da transação')
    }
    if (category.key === 'category') {
      return Alert.alert('Selecione o tipo da categoria')
    }

    const newTransaction = {
      id: String(uuid.v4()),
      ...form,
      type: transactionType,
      category: category.key,
      date: new Date()
    }

    try {
      const data = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.TRANSACTIONS)
      const currentData = data ? JSON.parse(data) : []
      const dataFormatted = [
        ...currentData,
        newTransaction
      ]

      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(dataFormatted))

      reset()
      setTransactionType('')
      setCategory({
        key: 'category',
        name: 'Categoria'
      })

      navigation.navigate('Listagem')
    } catch(error) {
      Alert.alert('Não foi possível salvar')
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>

        <Form>
          <Fields>
            <InputForm
              control={control}
              placeholder='Nome'
              name="name"
              autoCapitalize="sentences"
              error={errors.name && errors.name.message}
              autoCorrect={false}
            />
            <InputForm
              control={control}
              placeholder='Preço'
              name="amount"
              keyboardType='numeric'
              error={errors.amount && errors.amount.message}
            />
            
            <TransactionsTypes>
              <TransactionTypeButton 
                type="up" 
                title="Income"
                isActive={transactionType === 'positive'}
                onPress={() => handleTransactionsTypeSelect('positive')}
              />
              <TransactionTypeButton 
                type="down" 
                title="Outcome"
                isActive={transactionType === 'negative'}
                onPress={() => handleTransactionsTypeSelect('negative')}
              />
            </TransactionsTypes>

            <CategorySelectButton 
              title={category.name}
              onPress={handleOpenSelectCategoryModal}
            />
          </Fields>

          <Button
            title="Enviar"
            onPress={handleSubmit(handleRegister)}
          />
        </Form>

        <Modal visible={categoryModalOpen}>
          <CategorySelect 
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  )
}
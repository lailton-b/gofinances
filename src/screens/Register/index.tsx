import React, { useState } from 'react'
import { Alert, Keyboard, Modal, TouchableWithoutFeedback } from 'react-native'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

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
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  function handleTransactionsTypeSelect(type: 'up' | string) {
    setTransactionType(type)
  }

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true)
  }

  function handleCloseSelectCategoryModal() {
    setCategoryModalOpen(false)
  }

  function handleRegister(form: FormData) {
    if (!transactionType) {
      return Alert.alert('Selecione o tipo da transação')
    }
    if (category.key === 'category') {
      return Alert.alert('Selecione o tipo da categoria')
    }

    const data = {
      ...form,
      transactionType,
      category: category.key
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
                isActive={transactionType === 'up'}
                onPress={() => handleTransactionsTypeSelect('up')}
              />
              <TransactionTypeButton 
                type="down" 
                title="Outcome"
                isActive={transactionType === 'down'}
                onPress={() => handleTransactionsTypeSelect('down')}
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
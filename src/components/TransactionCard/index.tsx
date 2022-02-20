import React from 'react';
import { 
  Container, 
  Title, 
  Amount,
  Footer,
  Category,
  Icon,
  CategoryName,
  Date,
} from './styles';

interface Category {
  name: string;
  icon: string;
}

export interface TransactionCardProps {
  type: 'positive' | 'negative';
  title: string;
  amount: string;
  category: Category;
  date: string;
}

interface Props {
  data: TransactionCardProps
}

export function TransactionCard({
  data
}: Props) {
  const { title, amount, category, date, type } = data;

  return (
    <Container>
      <Title>{ title }</Title>
      <Amount type={data.type}>
      { type === 'negative' && '- ' }
      { amount }
      </Amount>

      <Footer>
        <Category>
          <Icon name={data.category.icon} />
          <CategoryName>{ category.name }</CategoryName>
        </Category>

        <Date>{ date }</Date>
      </Footer>
    </Container>
  )
}
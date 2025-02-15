import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Radio,
  RadioGroup,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Bet } from '../types';
import { betService } from '../services/betService';

interface PlaceBetFormProps {
  bet: Bet;
  onBetPlaced: (updatedBet: Bet) => void;
}

export const PlaceBetForm = ({ bet, onBetPlaced }: PlaceBetFormProps) => {
  const [name, setName] = useState('');
  const [prediction, setPrediction] = useState<string>('');
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    betService.addParticipant(bet.id, name, prediction);
    const updatedBet = betService.getBetByCode(bet.codeName);
    if (updatedBet) {
      onBetPlaced(updatedBet);
      toast({
        title: 'Bet placed!',
        status: 'success',
        duration: 3000,
      });
      setName('');
      setPrediction('');
    }
  };

  const renderPredictionInput = () => {
    switch (bet.type) {
      case 'GENDER':
        return (
          <RadioGroup value={prediction} onChange={setPrediction}>
            <Stack direction="row">
              <Radio value="BOY">Boy</Radio>
              <Radio value="GIRL">Girl</Radio>
            </Stack>
          </RadioGroup>
        );
      case 'SCALE':
        return (
          <NumberInput
            min={1}
            max={10}
            value={prediction}
            onChange={(value) => setPrediction(value)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        );
      case 'DURATION':
        return (
          <NumberInput
            min={0}
            value={prediction}
            onChange={(value) => setPrediction(value)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        );
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Your Name</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Your Prediction</FormLabel>
          {renderPredictionInput()}
        </FormControl>

        <Button type="submit" colorScheme="blue">
          Place Bet
        </Button>
      </Stack>
    </Box>
  );
}; 
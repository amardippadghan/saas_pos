import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'Downtown Branch' })
  name!: string;
  
  @ApiProperty({ example: '123 Main St, City', required: false })
  address?: string;
  
  @ApiProperty({ example: '555-0199', required: false })
  phone?: string;
}

export class UpdateBranchDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  phone?: string;
}

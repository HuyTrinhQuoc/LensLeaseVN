import { Controller, Post, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() body: any) {
    const userId = body.reviewer_id; 
    return this.reviewsService.createReview(userId, body);
  }
}